import { Chain } from '@audius/common'
import { call } from 'typed-redux-saga'

import { WalletConnection } from './types'

export function* getWalletAddress(connection: WalletConnection) {
  if (connection.chain === Chain.Sol) {
    return connection.provider.publicKey?.toString()
  }

  const accounts: string[] = yield* call(
    connection.provider.eth.getAccounts as () => Promise<string[]>
  )
  return accounts[0]
}
