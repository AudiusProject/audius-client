import { createSelector } from '@reduxjs/toolkit'

import { ID } from 'common/models/Identifiers'
import { CommonState } from 'common/store'
import { stringWeiToBN } from 'common/utils/wallet'
import {
  optimisticallyUpdateSupporters,
  optimisticallyUpdateSupporting
} from 'store/tipping/supportUtils'

import { SupportersMap, SupportingMap } from './types'

export const getSupporters = (state: CommonState) => state.tipping.supporters
export const getSupportersForUser = (state: CommonState, userId: ID) =>
  getSupporters(state)[userId]

export const getSupporterForUser = (
  state: CommonState,
  userId: ID,
  supporterId: ID
) => getSupporters(state)?.[userId]?.[supporterId]

export const getSupporting = (state: CommonState) => state.tipping.supporting
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

const getOptimisticSupportingBase = (state: CommonState) => {
  const { supporting, supportingOverrides } = state.tipping

  /**
   * Copy the supporting map into the eventually-merged map.
   */
  let mergedMap: SupportingMap = {}
  Object.assign(mergedMap, supporting)

  /**
   * Merge the default and override maps.
   */
  const userIds = (Object.keys(supportingOverrides) as unknown) as ID[]
  for (const userId of userIds) {
    // If the supporting map for a given user id exists in the overrides
    // but not in the default, copy the override map into the merged map.
    const shouldOverrideMap = !supporting[userId]
    if (shouldOverrideMap) {
      mergedMap = {
        ...mergedMap,
        [userId]: supportingOverrides[userId]
      }
    } else {
      // If the supporting value for a given user id and receiver id exists
      // in the overrides but not in the default,
      // OR
      // if the existing value in the default map has a smaller amount
      // than that in the override, the update default value with the
      // override value
      const receiverIds = (Object.keys(
        supportingOverrides[userId]
      ) as unknown) as ID[]
      for (const receiverId of receiverIds) {
        const shouldOverrideReceiver =
          !supporting[userId][receiverId] ||
          stringWeiToBN(supporting[userId][receiverId].amount).lt(
            stringWeiToBN(supportingOverrides[userId][receiverId].amount)
          )
        if (shouldOverrideReceiver) {
          mergedMap = {
            ...mergedMap,
            [userId]: {
              ...mergedMap[userId],
              [receiverId]: supportingOverrides[userId][receiverId]
            }
          }
        }
      }
    }
  }

  /**
   * Re-rank everything based on newly merged map.
   */
  let result: SupportingMap = {}
  const mergedUserIds = (Object.keys(mergedMap) as unknown) as ID[]
  for (const userId of mergedUserIds) {
    result = {
      ...result,
      [userId]: optimisticallyUpdateSupporting(mergedMap[userId])
    }
  }

  return result
}
export const getOptimisticSupporting = createSelector(
  getOptimisticSupportingBase,
  result => result
)

const getOptimisticSupportersBase = (state: CommonState) => {
  const { supporters, supportersOverrides } = state.tipping

  /**
   * Copy the supporters map into the eventually-merged map.
   */
  let mergedMap: SupportersMap = {}
  Object.assign(mergedMap, supporters)

  /**
   * Merge the default and override maps.
   */
  const userIds = (Object.keys(supportersOverrides) as unknown) as ID[]
  for (const userId of userIds) {
    // If the supporters map for a given user id exists in the overrides
    // but not in the default, copy the override map into the merged map.
    const shouldOverrideMap = !supporters[userId]
    if (shouldOverrideMap) {
      mergedMap = {
        ...mergedMap,
        [userId]: supportersOverrides[userId]
      }
    } else {
      // If the supporters value for a given user id and sender id exists
      // in the overrides but not in the default,
      // OR
      // if the existing value in the default map has a smaller amount
      // than that in the override, the update default value with the
      // override value
      const senderIds = (Object.keys(
        supportersOverrides[userId]
      ) as unknown) as ID[]
      for (const senderId of senderIds) {
        const shouldOverrideSender =
          !supporters[userId][senderId] ||
          stringWeiToBN(supporters[userId][senderId].amount).lt(
            stringWeiToBN(supportersOverrides[userId][senderId].amount)
          )
        if (shouldOverrideSender) {
          mergedMap = {
            ...mergedMap,
            [userId]: {
              ...mergedMap[userId],
              [senderId]: supportersOverrides[userId][senderId]
            }
          }
        }
      }
    }
  }

  /**
   * Re-rank everything based on newly merged map.
   */
  let result: SupportersMap = {}
  const mergedUserIds = (Object.keys(mergedMap) as unknown) as ID[]
  for (const userId of mergedUserIds) {
    result = {
      ...result,
      [userId]: optimisticallyUpdateSupporters(mergedMap[userId])
    }
  }

  return result
}
export const getOptimisticSupporters = createSelector(
  getOptimisticSupportersBase,
  result => result
)
