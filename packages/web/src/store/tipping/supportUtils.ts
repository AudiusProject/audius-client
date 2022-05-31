import { BNWei } from 'common/models/Wallet'
import {
  SupportersMapForUser,
  SupportingMapForUser
} from 'common/store/tipping/types'
import { Nullable } from 'common/utils/typeUtils'
import { stringWeiToBN } from 'common/utils/wallet'

export const optimisticallyUpdateSupporting = (
  supportingForUser: SupportingMapForUser
) => {
  /**
   * Sort the supporting values for the user by amount descending.
   */
  const supportingSortedDesc = Object.values(supportingForUser).sort((s1, s2) =>
    stringWeiToBN(s1.amount).gt(stringWeiToBN(s2.amount)) ? -1 : 1
  )

  /**
   * Update the ranks of all the supporting values
   * and store in new map.
   */
  let rank = 1
  let previousAmountBN: Nullable<BNWei> = null
  const map: SupportingMapForUser = {}
  for (let i = 0; i < supportingSortedDesc.length; i++) {
    if (!previousAmountBN) {
      // Store the first (and potentially only one) in the new map
      map[supportingSortedDesc[i].receiver_id] = {
        ...supportingSortedDesc[i],
        rank
      }
      previousAmountBN = stringWeiToBN(supportingSortedDesc[i].amount)
    } else {
      const currentAmountBN = stringWeiToBN(supportingSortedDesc[i].amount)
      if ((previousAmountBN as BNWei).gt(currentAmountBN)) {
        // If previous amount is greater than current, then
        // increment the rank for the current value.
        map[supportingSortedDesc[i].receiver_id] = {
          ...supportingSortedDesc[i],
          rank: ++rank
        }
      } else {
        // Otherwise, the amounts are equal (because we already
        // previously sorted). Thus, keep the same rank.
        map[supportingSortedDesc[i].receiver_id] = {
          ...supportingSortedDesc[i],
          rank
        }
      }
      // Update the previous amount.
      previousAmountBN = currentAmountBN
    }
  }

  return map
}

export const optimisticallyUpdateSupporters = (
  supportersForUser: SupportersMapForUser
) => {
  /**
   * Sort the supporters values for the user by amount descending.
   */
  const supportersSortedDesc = Object.values(supportersForUser).sort((s1, s2) =>
    stringWeiToBN(s1.amount).gt(stringWeiToBN(s2.amount)) ? -1 : 1
  )

  /**
   * Update the ranks of all the supporters values
   * and store in new map.
   */
  let rank = 1
  let previousAmountBN: Nullable<BNWei> = null
  const map: SupportersMapForUser = {}
  for (let i = 0; i < supportersSortedDesc.length; i++) {
    if (!previousAmountBN) {
      // Store the first (and potentially only one) in the new map
      map[supportersSortedDesc[i].sender_id] = {
        ...supportersSortedDesc[i],
        rank
      }
      previousAmountBN = stringWeiToBN(supportersSortedDesc[i].amount)
    } else {
      const currentAmountBN = stringWeiToBN(supportersSortedDesc[i].amount)
      if ((previousAmountBN as BNWei).gt(currentAmountBN)) {
        // If previous amount is greater than current, then
        // increment the rank for the current value.
        map[supportersSortedDesc[i].sender_id] = {
          ...supportersSortedDesc[i],
          rank: ++rank
        }
      } else {
        // Otherwise, the amounts are equal (because we already
        // previously sorted). Thus, keep the same rank.
        map[supportersSortedDesc[i].sender_id] = {
          ...supportersSortedDesc[i],
          rank
        }
      }
      // Update the previous amount.
      previousAmountBN = currentAmountBN
    }
  }

  return map
}
