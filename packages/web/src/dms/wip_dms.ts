///
/// basic client
///

import { ChantCodec } from './codec'

const baseUrl = `https://discoveryprovider3.staging.audius.co`

export async function dmSend(toWallet: string, message: string) {
  const signed = await signRpc({
    id: new Date(),
    method: 'dm.send',
    params: {
      toWallet,
      message
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

  for (let rpc of respBody) {
    console.log('dms', {
      from: rpc.wallet,
      to: rpc.params.toWallet,
      message: rpc.params.message
    })
  }
}

async function signRpc(rpc: any) {
  const audiusLibs = window.audiusLibs
  const wallet = audiusLibs.Account.hedgehog.getWallet()
  const privateKey = wallet.privateKey

  const codec = new ChantCodec(privateKey)
  const signed = codec.encode(rpc)
  return signed
}

Object.assign(window, {
  dmGet,
  dmSend
})
