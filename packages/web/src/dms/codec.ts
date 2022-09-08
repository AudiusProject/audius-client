import * as msgpack from '@msgpack/msgpack'
import * as secp from '@noble/secp256k1'
import * as aes from 'micro-aes-gcm'

///
/// copy-pasted from:
///   https://github.com/AudiusProject/audius-docker-compose/blob/nats/discovery-provider/clusterizer/src/codec.ts
///
type EncodeOpts = {
  encPublicKey?: Uint8Array
  symKey?: Uint8Array
}

const MAGIC = {
  signed: 11,
  asym: 12,
  sym: 13
}

export class ChantCodec {
  publicKey: Uint8Array
  private privateKey: Uint8Array
  private keys: Uint8Array[] = []

  constructor(privateKey: Uint8Array) {
    this.privateKey = privateKey
    this.publicKey = secp.getPublicKey(privateKey)
    this.addKey(privateKey)
  }

  addKey(key: Uint8Array) {
    this.keys.push(key)
  }

  async encode(obj: unknown, opts?: EncodeOpts) {
    const json = msgpack.encode(obj)
    const signed = await this.sign(json, this.privateKey)
    if (opts?.encPublicKey) {
      return this.encryptAsym(signed, opts.encPublicKey)
    } else if (opts?.symKey) {
      return this.encryptSym(signed, opts.symKey)
    } else {
      return signed
    }
  }

  async decode<T>(
    bytes: Uint8Array
  ): Promise<{ data: T; publicKey: Uint8Array } | undefined> {
    const [magic, ...rest] = msgpack.decode(bytes) as any[]

    // attempt to decrypt
    switch (magic) {
      case MAGIC.asym:
        for (const key of this.keys) {
          try {
            const clear = await this.decryptAsym(rest, key)
            return this.decode(clear)
          } catch (e) {}
        }
        break
      case MAGIC.sym:
        for (const key of this.keys) {
          try {
            const clear = await this.decryptSym(rest, key)
            return this.decode(clear)
          } catch (e) {}
        }
        break
      case MAGIC.signed:
        break
    }

    try {
      const { bytes, publicKey, valid } = await this.unsign(rest)
      if (!valid) {
        console.log('invalid signature')
        return
      }
      const data = msgpack.decode(bytes) as T
      return {
        data,
        publicKey
      }
    } catch (e) {}
  }

  private async sign(bytes: Uint8Array, privateKey: Uint8Array) {
    const messageHash = await secp.utils.sha256(bytes)
    const [signature, recovery] = await secp.sign(messageHash, privateKey, {
      recovered: true,
      extraEntropy: true
    })
    const signed = msgpack.encode([MAGIC.signed, bytes, signature, recovery])
    return signed
  }

  private async unsign(blobs: Uint8Array[]) {
    const [bytes, signature, recovery] = blobs
    const messageHash = await secp.utils.sha256(bytes)

    const publicKey = secp.recoverPublicKey(
      messageHash,
      signature,
      recovery as any
    )
    const valid = secp.verify(signature, messageHash, publicKey)
    return { bytes, publicKey, signature, valid }
  }

  private async encryptAsym(bytes: Uint8Array, publicKey: Uint8Array) {
    const ephemPrivateKey = secp.utils.randomPrivateKey()
    const ephemPublicKey = secp.getPublicKey(ephemPrivateKey)
    const shared = this.getSharedSecret(ephemPrivateKey, publicKey)
    const ciphertext = await aes.encrypt(shared, bytes)
    return msgpack.encode([MAGIC.asym, ephemPublicKey, ciphertext])
  }

  private async decryptAsym(blobs: Uint8Array[], privateKey: Uint8Array) {
    const [ephemPublicKey, ciphertext] = blobs
    const shared = this.getSharedSecret(privateKey, ephemPublicKey)
    const clear = await aes.decrypt(shared, ciphertext)
    return clear
  }

  private getSharedSecret(privateKey: Uint8Array, publicKey: Uint8Array) {
    let shared = secp.getSharedSecret(privateKey, publicKey, true)
    shared = shared.slice(shared.length - 32)
    return shared
  }

  private async encryptSym(bytes: Uint8Array, shared: Uint8Array) {
    const ciphertext = await aes.encrypt(shared, bytes)
    return msgpack.encode([MAGIC.sym, ciphertext])
  }

  private async decryptSym(blobs: Uint8Array[], shared: Uint8Array) {
    const [bytes] = blobs
    return aes.decrypt(shared, bytes)
  }
}
