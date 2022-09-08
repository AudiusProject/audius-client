///
/// basic client
///

import { base64 } from '@scure/base'
import { ChantCodec } from './codec'

const baseUrl = `https://discoveryprovider3.staging.audius.co`

export async function dmSend(toWallet: string, message: string) {
  const toPublicKey = await getPublicKey(toWallet)
  if (!toPublicKey) {
    console.error(`failed to get public key for wallet ${toWallet}`)
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

  const resp = await fetch(baseUrl + '/clusterizer/op', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-audius-msg'
    },
    body: signed
  })
  const respBody = await resp.json()

  console.log('dms', resp.status, respBody)
}

export async function dmGet() {
  const signed = await signRpc({
    method: 'dm.get'
  })

  const resp = await fetch(baseUrl + '/clusterizer/query', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-audius-msg'
    },
    body: signed
  })

  const respBody = await resp.json()

  const codec = getCodec()
  for (let rpc of respBody) {
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
  const got = await fetch(baseUrl + `/clusterizer/pubkey/${wallet}`)
  if (got.status != 200) return
  const txt = await got.text()
  return base64.decode(txt)
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
