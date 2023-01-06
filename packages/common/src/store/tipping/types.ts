import { TipSource } from '../../models/Analytics'
import { ID } from '../../models/Identifiers'
import { Supporter, Supporting, UserTip } from '../../models/Tipping'
import { User } from '../../models/User'
import { StringAudio } from '../../models/Wallet'
import { Nullable } from '../../utils/typeUtils'

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
export type SupportersMapForUser = Record<ID, Supporter>
export type SupportersMap = Record<ID, SupportersMapForUser>

export type SupportingMapForUser = Record<ID, Supporting>
export type SupportingMap = Record<ID, SupportingMapForUser>

export type TippingState = {
  supporters: SupportersMap
  supportersOverrides: SupportersMap
  supporting: SupportingMap
  supportingOverrides: SupportingMap
  send: {
    status: Nullable<TippingSendStatus>
    user: Nullable<User>
    amount: StringAudio
    error: Nullable<string>
    source: TipSource
  }
  tipToDisplay: Nullable<UserTip>
  showTip: boolean
}

export type RefreshSupportPayloadAction = {
  senderUserId: ID
  receiverUserId: ID
  supportingLimit?: number
  supportersLimit?: number
}
