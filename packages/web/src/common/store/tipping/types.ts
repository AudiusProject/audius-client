import { ID } from 'common/models/Identifiers'
import { Supporter, Supporting } from 'common/models/Tipping'
import { User } from 'common/models/User'
import { BNWei } from 'common/models/Wallet'
import { Nullable } from 'common/utils/typeUtils'

export type TippingSendStatus =
  | 'SEND'
  | 'CONFIRM'
  | 'SENDING'
  | 'SUCCESS'
  | 'ERROR'
export type TippingState = {
  /**
   * Example:
   * {
   *   1: {
   *     2: <supporter object for user 2>
   *     3: <supporter object for user 3>
   *   },
   *   4: {
   *     2: <supporter object for user 2>
   *     3: <supporter object for user 3>
   *   }
   * }
   * 
   * The above means that users 2 and 3 are supporters of users 1 and 4.
   * The same structure applies to supporting.
   */
  supporters: Record<ID, Record<ID, Supporter>>
  supporting: Record<ID, Record<ID, Supporting>>
  send: {
    status: Nullable<TippingSendStatus>
    user: Nullable<User>
    amount: BNWei
    error: Nullable<string>
  }
}
