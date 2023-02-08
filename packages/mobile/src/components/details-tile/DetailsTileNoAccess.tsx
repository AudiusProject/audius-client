import type { PremiumConditions, ID } from '@audius/common'
import { premiumContentSelectors } from '@audius/common'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

const { getPremiumTrackStatusMap } = premiumContentSelectors

const DetailsTileLockedSection = ({
  premiumConditions
}: {
  premiumConditions: PremiumConditions
}) => {
  return <View></View>
}

const DetailsTileUnlockingSection = ({
  premiumConditions
}: {
  premiumConditions: PremiumConditions
}) => {
  return <View></View>
}

type DetailsTileNoAccessProps = {
  premiumConditions: PremiumConditions
  trackId: ID
}

export const DetailsTileNoAccess = ({
  trackId,
  premiumConditions
}: DetailsTileNoAccessProps) => {
  const premiumTrackStatusMap = useSelector(getPremiumTrackStatusMap)
  const premiumTrackStatus = premiumTrackStatusMap[trackId] ?? null

  if (premiumTrackStatus === 'UNLOCKING') {
    return <DetailsTileUnlockingSection premiumConditions={premiumConditions} />
  }

  return <DetailsTileLockedSection premiumConditions={premiumConditions} />
}
