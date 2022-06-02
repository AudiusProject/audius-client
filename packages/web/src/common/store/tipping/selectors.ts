import { createSelector } from '@reduxjs/toolkit'

import { ID } from 'common/models/Identifiers'
import { Supporter, Supporting } from 'common/models/Tipping'
import { BNWei } from 'common/models/Wallet'
import { CommonState } from 'common/store'
import { Nullable } from 'common/utils/typeUtils'
import { stringWeiToBN } from 'common/utils/wallet'

import { SupportersMap, SupportersMapForUser, SupportingMap } from './types'

export const getSupporters = (state: CommonState) => state.tipping.supporters
export const getSupportersOverrides = (state: CommonState) =>
  state.tipping.supportersOverrides
export const getSupportersForUser = (state: CommonState, userId: ID) =>
  getSupporters(state)[userId]

export const getSupporterForUser = (
  state: CommonState,
  userId: ID,
  supporterId: ID
) => getSupporters(state)?.[userId]?.[supporterId]

export const getSupporting = (state: CommonState) => state.tipping.supporting
export const getSupportingOverrides = (state: CommonState) =>
  state.tipping.supportingOverrides
export const getSupportingForUser = (state: CommonState, userId: ID) =>
  getSupporting(state)[userId]

export const getSupportedUserByUser = (
  state: CommonState,
  userId: ID,
  supportingId: ID
) => getSupporting(state)?.[userId]?.[supportingId]

export const getSendStatus = (state: CommonState) => state.tipping.send.status
export const getSendAmount = (state: CommonState) => state.tipping.send.amount
export const getSendUser = (state: CommonState) => state.tipping.send.user
export const getSendTipData = (state: CommonState) => state.tipping.send

export const getRecentTips = (state: CommonState) => state.tipping.recentTips
export const getTipToDisplay = (state: CommonState) =>
  state.tipping.tipToDisplay
export const getShowTip = (state: CommonState) => state.tipping.showTip
export const getMainUser = (state: CommonState) => state.tipping.mainUser

const mergeMaps = <
  MapType extends Record<ID, Record<ID, Supporter | Supporting>>
>({
  map,
  mapOverrides
}: {
  map: MapType
  mapOverrides: MapType
}): MapType => {
  /**
   * Copy the support map into the eventually-merged map.
   */
  const mergedMap = { ...map }

  /**
   * Merge the default and override maps.
   */
  const userIds = (Object.keys(mapOverrides) as unknown) as ID[]
  for (const userId of userIds) {
    // If the support map for a given user id exists in the overrides
    // but not in the default, copy the override map into the merged map.
    const shouldOverrideMap = !map[userId]
    if (shouldOverrideMap) {
      mergedMap[userId] = mapOverrides[userId]
    } else {
      // If the support value for a given user id and sender/receiver id exists
      // in the overrides but not in the default,
      // OR
      // if the existing value in the default map has a smaller amount
      // than that in the override, the update default value with the
      // override value
      const supportIds = (Object.keys(mapOverrides[userId]) as unknown) as ID[]
      for (const supportId of supportIds) {
        const shouldOverrideValue =
          !map[userId][supportId] ||
          stringWeiToBN(map[userId][supportId].amount).lt(
            stringWeiToBN(mapOverrides[userId][supportId].amount)
          )
        if (shouldOverrideValue) {
          mergedMap[userId] = {
            ...mergedMap[userId],
            [supportId]: mapOverrides[userId][supportId]
          }
        }
      }
    }
  }

  return mergedMap
}

const getOptimisticSupportingBase = (state: CommonState) => {
  const { supporting, supportingOverrides } = state.tipping

  /**
   * Merge supporting maps
   */
  const mergedMap = mergeMaps<SupportingMap>({
    map: supporting,
    mapOverrides: supportingOverrides
  })

  /**
   * Note that for supporting, rank is not super relevant
   * as we do not display supporting ranks; we only display
   * supporters ranks (so far).
   * So, for supporting we sort by amounts descending but we
   * don't optimistically update ranks (and we can't anyway, since
   * the correct rank would need to take other supporters of a given
   * user into consideration, which we don't have access to).
   * So we simply return the merged map
   */
  return mergedMap
}
export const getOptimisticSupporting = createSelector(
  getOptimisticSupportingBase,
  result => result
)

export const rerankSupportersMapForUser = (
  supportersForUser: SupportersMapForUser
) => {
  /**
   * Sort the supporters values for the user by amount descending.
   */
  const supportersSortedDesc = Object.values<Supporter>(
    supportersForUser
  ).sort((s1, s2) =>
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

const getOptimisticSupportersBase = (state: CommonState) => {
  const { supporters, supportersOverrides } = state.tipping

  /**
   * Merge supporter maps
   */
  const mergedMap = mergeMaps<SupportersMap>({
    map: supporters,
    mapOverrides: supportersOverrides
  })

  /**
   * Re-rank everything based on newly merged map.
   */
  const result: SupportersMap = {}
  const mergedUserIds = (Object.keys(mergedMap) as unknown) as ID[]
  for (const userId of mergedUserIds) {
    result[userId] = rerankSupportersMapForUser(mergedMap[userId])
  }

  return result
}
export const getOptimisticSupporters = createSelector(
  getOptimisticSupportersBase,
  result => result
)
