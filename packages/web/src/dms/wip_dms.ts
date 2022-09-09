///
/// basic client
///

import * as secp from '@noble/secp256k1'
import { base64 } from '@scure/base'

import { ChantCodec } from './codec'

const baseUrls = [
  'https://discoveryprovider.staging.audius.co',
  'https://discoveryprovider2.staging.audius.co',
  'https://discoveryprovider3.staging.audius.co',
  'https://discoveryprovider5.staging.audius.co'
]
function baseUrl() {
  const u = baseUrls[Math.floor(Math.random() * baseUrls.length)]
  return u
}

export async function dmSend(toWallet: string, message: string) {
  const toPublicKey = await getPublicKey(toWallet.toLowerCase())
  if (!toPublicKey) {
    console.error(`dms failed to get public key for wallet ${toWallet}`)
    return
  }

  /// this object will be encrypted and only visible to the reciever
  /// the fields can be arbitrary, but they won't be visible to discovery postgres or anything
  const innerMessage = {
    message,
    sentAt: new Date()
  }

  const encryptedMessage = await asymEncrypt(innerMessage, toPublicKey)

  const signed = await signRpc({
    id: new Date(),
    method: 'dm.send',
    params: {
      toWallet,
      encryptedMessage
    }
  })

  const resp = await fetch(baseUrl() + '/clusterizer/op', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-audius-msg'
    },
    body: signed
  })
  const respBody = await resp.json()

  console.log('dms sent', resp.status, respBody)
}

export async function dmGet() {
  const signed = await signRpc({
    method: 'dm.get'
  })

  const resp = await fetch(baseUrl() + '/clusterizer/query', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-audius-msg'
    },
    body: signed
  })

  const respBody = await resp.json()

  const codec = getCodec()
  for (const rpc of respBody) {
    if (rpc.params.encryptedMessage) {
      const decrypted = await codec.decode(rpc.params.encryptedMessage.data)
      if (decrypted) {
        console.log('dms encrypted message from:', rpc.wallet, decrypted.data)
      }
    } else {
      console.log('dms plain message (legacy)', {
        from: rpc.wallet,
        ...rpc.params
      })
    }
  }
}

async function getPublicKey(wallet: string): Promise<Uint8Array | undefined> {
  const got = await fetch(baseUrl() + `/clusterizer/pubkey/${wallet}`)
  if (got.status !== 200) return
  const txt = await got.text()
  const pubkey = base64.decode(txt)
  // add 4 byte prefix to recovered public key
  // ethereum's weirdo signature conventions chops this off, so re-add so that getSharedSecret can work:
  // see: https://github.com/ethereumjs/ethereumjs-monorepo/blob/master/packages/util/src/signature.ts#L34-L67
  //
  // maybe the recover code in clusterizer should do this
  if (pubkey.length == 64) {
    return secp.utils.concatBytes(new Uint8Array([4]), pubkey)
  } else if (pubkey.length == 65) {
    return pubkey
  } else {
    console.error(`pubkey wrong length: expected 65, got ${pubkey.length}`)
  }
}

async function signRpc(rpc: any) {
  const codec = getCodec()

  const signed = codec.encode(rpc)
  return signed
}

async function asymEncrypt(obj: any, forPublicKey: Uint8Array) {
  const codec = getCodec()
  return codec.encode(obj, {
    encPublicKey: forPublicKey
  })
}

function getCodec() {
  const audiusLibs = window.audiusLibs
  const wallet = audiusLibs.Account.hedgehog.getWallet()
  const privateKey = wallet.privateKey
  if (!privateKey) {
    throw new Error(`can't create codec: hedgehog wallet private key missing`)
  }
  const codec = new ChantCodec(privateKey)
  return codec
}

Object.assign(window, {
  dmGet,
  dmSend
})
