import { ID } from '../models/Identifiers'
import { Supporting } from '../models/Tipping'
import { cacheUsersSelectors } from '../store/cache'
import { tippingSelectors } from '../store/tipping'
import { stringWeiToBN } from '../utils'

import { useProxySelector } from './useProxySelector'
const { getUsers } = cacheUsersSelectors

const { getOptimisticSupportingForUser } = tippingSelectors

/**
 * Returns a list of `Supporting` records for a given user, ordered by
 * contribution amount. NOTE: This hook is subject to pagination on the /supporting
 * endpoint calls and will only return the top N results. `User.supporting_count`
 * will contain the full count.
 */
export const useRankedSupportingForUser = ({
  userId,
  excludeDeactivated = false
}: {
  userId: number
  excludeDeactivated?: boolean
}) => {
  return useProxySelector(
    (state) => {
      const supportingForUser = getOptimisticSupportingForUser(state, userId)

      const ids = (
        supportingForUser ? Object.keys(supportingForUser) : ([] as unknown)
      ) as ID[]

      const supportingIdsSorted = ids.sort((id1, id2) => {
        const amount1BN = stringWeiToBN(supportingForUser[id1].amount)
        const amount2BN = stringWeiToBN(supportingForUser[id2].amount)
        return amount1BN.gte(amount2BN) ? -1 : 1
      })

      const rankedSupportingForUser = supportingIdsSorted
        .map((supporterId) => supportingForUser[supporterId])
        .filter(Boolean)

      // Can remove once supporters endpoint excludes deactivated users from response:
      if (excludeDeactivated) {
        const usersMap = getUsers(state, {
          ids
        })
        return rankedSupportingForUser.filter(
          (s: Supporting) => !usersMap[s.receiver_id].is_deactivated
        )
      } else {
        return rankedSupportingForUser
      }
    },
    [userId]
  )
}
