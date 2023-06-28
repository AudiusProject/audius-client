import { keccak_256 } from '@noble/hashes/sha3'
import * as secp from '@noble/secp256k1'
import { signTypedData } from 'eth-sig-util'

import { waitForLibsInit } from 'services/audius-backend/eagerLoadUtils'

export const auth = {
  sign: async (data: string) => {
    await waitForLibsInit()
    return await secp.sign(
      keccak_256(data),
      // @ts-ignore private key is private
      window.audiusLibs.hedgehog?.getWallet()?.privateKey,
      {
        recovered: true,
        der: false
      }
    )
  },
  signTransaction: async (data: any) => {
    await waitForLibsInit()
    return signTypedData(
      Buffer.from(
        // @ts-ignore private key is private
        window.audiusLibs.hedgehog?.getWallet()?.privateKey,
        'hex'
      ),
      {
        data: data as any
      }
    )
  },
  getSharedSecret: async (publicKey: string | Uint8Array) => {
    await waitForLibsInit()
    return secp.getSharedSecret(
      // @ts-ignore private key is private
      window.audiusLibs.hedgehog?.getWallet()?.privateKey,
      publicKey,
      true
    )
  },
  getAddress: async () => {
    await waitForLibsInit()
    return window.audiusLibs?.hedgehog?.wallet?.getAddressString() ?? ''
  }
}
