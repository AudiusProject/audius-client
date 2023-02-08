import { Track } from 'models'
import { useMemo } from 'react'

import { useSelector } from 'react-redux'
import { premiumContentSelectors } from 'store/premium-content'
import { Nullable } from 'utils'

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
