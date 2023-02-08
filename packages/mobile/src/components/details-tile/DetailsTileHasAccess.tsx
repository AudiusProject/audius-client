import type { PremiumConditions } from '@audius/common'
import { View } from 'react-native'

const DetailsTileUnlockedSection = ({
  premiumConditions
}: {
  premiumConditions: PremiumConditions
}) => {
  return <View></View>
}

const DetailsTileOwnerSection = ({
  premiumConditions
}: {
  premiumConditions: PremiumConditions
}) => {
  return <View></View>
}

type DetailsTilePremiumAccessProps = {
  premiumConditions: PremiumConditions
  isOwner: boolean
}

export const DetailsTileHasAccess = ({
  premiumConditions,
  isOwner
}: DetailsTilePremiumAccessProps) => {
  if (isOwner) {
    return <DetailsTileOwnerSection premiumConditions={premiumConditions} />
  }

  return <DetailsTileUnlockedSection premiumConditions={premiumConditions} />
}
