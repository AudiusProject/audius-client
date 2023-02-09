import { PremiumConditions, Track } from 'models'
import { useMemo } from 'react'

import { useSelector } from 'react-redux'
import { cacheUsersSelectors } from 'store/cache'
import { premiumContentSelectors } from 'store/premium-content'
import { CommonState } from 'store/reducers'
import { Nullable } from 'utils'

const { getUsers } = cacheUsersSelectors
const { getPremiumTrackSignatureMap } = premiumContentSelectors

export const usePremiumContentAccess = (track: Nullable<Partial<Track>>) => {
  if (!track) {
    return { isUserAccessTBD: false, doesUserHaveAccess: true }
  }

  const premiumTrackSignatureMap = useSelector(getPremiumTrackSignatureMap)

  const { isUserAccessTBD, doesUserHaveAccess } = useMemo(() => {
    const trackId = track.track_id
    const isPremium = track.is_premium
    const hasPremiumContentSignature =
      !!track.premium_content_signature ||
      !!(trackId && premiumTrackSignatureMap[trackId])
    const isCollectibleGated = !!track.premium_conditions?.nft_collection
    const isSignatureToBeFetched =
      isCollectibleGated &&
      !!trackId &&
      premiumTrackSignatureMap[trackId] === undefined

    return {
      isUserAccessTBD: !hasPremiumContentSignature && isSignatureToBeFetched,
      doesUserHaveAccess: !isPremium || hasPremiumContentSignature
    }
  }, [track, premiumTrackSignatureMap])

  return { isUserAccessTBD, doesUserHaveAccess }
}

export const useSpecialAccessEntity = (premiumConditions: Nullable<PremiumConditions>) => {
  const { follow_user_id: followUserId, tip_user_id: tipUserId, nft_collection: nftCollection } =
    premiumConditions ?? {}

  const users = useSelector((state: CommonState) =>
    getUsers(state, {
      ids: [followUserId, tipUserId].filter((id): id is number => !!id)
    })
  )
  const followee = useMemo(
    () => (followUserId ? users[followUserId] : null),
    [users, followUserId]
  )
  const tippedUser = useMemo(
    () => (tipUserId ? users[tipUserId] : null),
    [users, tipUserId]
  )

  return { nftCollection:  nftCollection ?? null, followee, tippedUser }
}
