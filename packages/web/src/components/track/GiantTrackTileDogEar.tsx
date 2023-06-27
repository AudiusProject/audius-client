import { FeatureFlags } from '@audius/common'

import { DogEar, DogEarType } from 'components/dog-ear'
import { useFlag } from 'hooks/useRemoteConfig'

export const GiantTrackTileDogEar = ({ type }: { type: DogEarType }) => {
  const { isEnabled: isGatedContentEnabled } = useFlag(
    FeatureFlags.GATED_CONTENT_ENABLED
  )

  if (!isGatedContentEnabled) {
    return null
  }

  return <DogEar type={type} />
}
