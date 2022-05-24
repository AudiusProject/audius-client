import { ID } from 'common/models/Identifiers'
import { Supporter, Supporting, UserTip } from 'common/models/Tipping'
import { User } from 'common/models/User'
import { BNWei } from 'common/models/Wallet'
import { Nullable } from 'common/utils/typeUtils'

export type TippingSendStatus =
  | 'SEND'
  | 'CONFIRM'
  | 'SENDING'
  | 'CONVERTING'
  | 'SUCCESS'
  | 'ERROR'

/**
 * Example for supporters map (and similarly supporting map):
 * {
 *   one: {
 *     two: <supporter object for user two>
 *     three: <supporter object for user three>
 *   },
 *   four: {
 *     two: <supporter object for user two>
 *     three: <supporter object for user three>
 *   }
 * }
 *
 * The above means that users 'two' and 'three' are supporters of users 'one' and 'four'.
 * The same structure applies to supporting.
 * Structured it this way to make it easy to check whether a user
 * is supported by / supports another user.
 */
type SupportersMapForUser = Record<ID, Supporter>
type SupportersMap = Record<ID, SupportersMapForUser>

type SupportingMapForUser = Record<ID, Supporting>
type SupportingMap = Record<ID, SupportingMapForUser>

export type TippingState = {
  supporters: SupportersMap
  supporting: SupportingMap
  send: {
    status: Nullable<TippingSendStatus>
    user: Nullable<User>
    amount: BNWei
    error: Nullable<string>
  },
  recentTips: UserTip[]
  recentTip: Nullable<UserTip>
}
