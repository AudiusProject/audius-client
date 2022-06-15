import { createSelector } from '@reduxjs/toolkit'

import { ID } from 'common/models/Identifiers'
import { Supporter, Supporting } from 'common/models/Tipping'
import { BNWei } from 'common/models/Wallet'
import { CommonState } from 'common/store'
import { getId as getSupportingId } from 'common/store/user-list/supporting/selectors'
import { getId as getSupportersId } from 'common/store/user-list/top-supporters/selectors'
import { Nullable } from 'common/utils/typeUtils'
import { stringWeiToBN } from 'common/utils/wallet'

import { SupportersMap, SupportersMapForUser, SupportingMap } from './types'

export const getSupporters = (state: CommonState) => state.tipping.supporters
export const getSupportersOverrides = (state: CommonState) =>
  state.tipping.supportersOverrides

export const getSupporting = (state: CommonState) => state.tipping.supporting
export const getSupportingOverrides = (state: CommonState) =>
  state.tipping.supportingOverrides

export const getSendStatus = (state: CommonState) => state.tipping.send.status
export const getSendAmount = (state: CommonState) => state.tipping.send.amount
export const getSendUser = (state: CommonState) => state.tipping.send.user
export const getSendTipData = (state: CommonState) => state.tipping.send

export const getRecentTips = (state: CommonState) => state.tipping.recentTips
export const getTipToDisplay = (state: CommonState) =>
  state.tipping.tipToDisplay
export const getShowTip = (state: CommonState) => state.tipping.showTip

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

export const getOptimisticSupporting = createSelector(
  getSupporting,
  getSupportingOverrides,
  (supporting, supportingOverrides) =>
    mergeMaps<SupportingMap>({
      map: supporting,
      mapOverrides: supportingOverrides
    })
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

export const getOptimisticSupporters = createSelector(
  getSupporters,
  getSupportersOverrides,
  (supporters, supportersOverrides) => {
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
)

export const getOptimisticSupportingForUser = (
  state: CommonState,
  userId: ID
) => getOptimisticSupporting(state)[userId]

export const getOptimisticSupportersForUser = (
  state: CommonState,
  userId: ID
) => getOptimisticSupporters(state)[userId]

export const getOptimisticUserIdsIfNeeded = (
  state: CommonState,
  { userIds, tag }: { userIds: ID[]; tag: string }
) => {
  const userIdSet = new Set(userIds)

  if (tag === 'SUPPORTING') {
    /**
     * Get supporting overrides for the user whose modal info is displayed.
     * If none, then return userIds as-is.
     */
    const userId = getSupportingId(state)
    if (!userId) {
      return userIds
    }

    const supportingOverridesMap = getSupportingOverrides(state)
    const supportingOverridesMapForUser = supportingOverridesMap[userId] || {}
    const supportingOverridesKeysForUser = Object.keys(
      supportingOverridesMapForUser
    ).map(k => parseInt(k))
    if (supportingOverridesKeysForUser.length === 0) {
      return userIds
    }

    /**
     * Include optimistic user ids that are not in userIds by getting
     * the optimistic supporting data, sorting by amount descending,
     * and checking the sorted ids in both the given userIds and the
     * optimistic user ids to include. This also preserves the sort
     * order and thus eventually displays the users correctly in the
     * supporting list modal.
     */
    const optimisticUserIdSetToInclude = new Set(
      supportingOverridesKeysForUser.filter(id => !userIdSet.has(id))
    )
    const optimisticSupporting = getOptimisticSupporting(state)
    const optimisticSupportingForUser = optimisticSupporting[userId]
    const optimisticSupportingForUserKeys = Object.keys(
      optimisticSupportingForUser
    ).map(k => parseInt(k))

    const sortedIdsDesc = optimisticSupportingForUserKeys.sort((k1, k2) => {
      const amount1BN = stringWeiToBN(optimisticSupportingForUser[k1].amount)
      const amount2BN = stringWeiToBN(optimisticSupportingForUser[k2].amount)
      return amount1BN.gte(amount2BN) ? -1 : 1
    })

    const resultIds: ID[] = []
    sortedIdsDesc.forEach(id => {
      if (userIdSet.has(id) || optimisticUserIdSetToInclude.has(id)) {
        resultIds.push(id)
      }
    })
    return resultIds
  } else if (tag === 'TOP SUPPORTERS') {
    /**
     * Get supporters overrides for the user whose modal info is displayed.
     * If none, then return userIds as-is.
     */
    const userId = getSupportersId(state)
    if (!userId) {
      return userIds
    }

    const supportersOverridesMap = getSupportersOverrides(state)
    const supportersOverridesMapForUser = supportersOverridesMap[userId] || {}
    const supportersOverridesKeysForUser = Object.keys(
      supportersOverridesMapForUser
    ).map(k => parseInt(k))
    if (supportersOverridesKeysForUser.length === 0) {
      return userIds
    }

    /**
     * Include optimistic user ids that are not in userIds by getting
     * the optimistic supporters data, sorting by amount descending,
     * and checking the sorted ids in both the given userIds and the
     * optimistic user ids to include. This also preserves the sort
     * order and thus eventually displays the users correctly in the
     * top supporters list modal.
     */
    const optimisticUserIdSetToInclude = new Set(
      supportersOverridesKeysForUser.filter(id => !userIdSet.has(id))
    ) as Set<number>
    const optimisticSupporters = getOptimisticSupporters(state)
    const optimisticSupportersForUser = optimisticSupporters[userId]
    const optimisticSupportersForUserKeys = Object.keys(
      optimisticSupportersForUser
    ).map(k => parseInt(k))

    const sortedIdsDesc = optimisticSupportersForUserKeys.sort((k1, k2) => {
      const amount1BN = stringWeiToBN(optimisticSupportersForUser[k1].amount)
      const amount2BN = stringWeiToBN(optimisticSupportersForUser[k2].amount)
      return amount1BN.gte(amount2BN) ? -1 : 1
    })

    const resultIds: ID[] = []
    sortedIdsDesc.forEach(id => {
      if (userIdSet.has(id) || optimisticUserIdSetToInclude.has(id)) {
        resultIds.push(id)
      }
    })
    return resultIds
  }

  return userIds
}
