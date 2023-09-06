import { useMemo } from 'react'

import {
  isPremiumContentCollectibleGated,
  isPremiumContentUSDCPurchaseGated,
  type PremiumConditions,
  PremiumContentType
} from '@audius/common'
import { View } from 'react-native'

import IconCart from 'app/assets/images/iconCart.svg'
import IconCollectible from 'app/assets/images/iconCollectible.svg'
import IconSpecialAccess from 'app/assets/images/iconSpecialAccess.svg'
import { Text } from 'app/components/core'
import { useIsUSDCEnabled } from 'app/hooks/useIsUSDCEnabled'
import { makeStyles, flexRowCentered } from 'app/styles'
import { spacing } from 'app/styles/spacing'
import { useThemeColors } from 'app/utils/theme'

const messages = {
  collectibleGated: 'Collectible Gated',
  specialAccess: 'Special Access',
  premium: 'Premium'
}

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  root: {
    ...flexRowCentered(),
    gap: spacing(1)
  }
}))

type LineupTilePremiumContentTypeTagProps = {
  premiumConditions: PremiumConditions
  doesUserHaveAccess?: boolean
  isOwner: boolean
}

/**
 * Returns a tag that indicates the type of premium content
 * @param premiumConditions the track's premium conditions
 * @param doesUserHaveAccess whether the user has access to stream the track
 * @isOwner whether the user is the owner of the track
 */
export const LineupTilePremiumContentTypeTag = ({
  premiumConditions,
  doesUserHaveAccess,
  isOwner
}: LineupTilePremiumContentTypeTagProps) => {
  const styles = useStyles()
  const { accentBlue, neutralLight4, specialLightGreen } = useThemeColors()
  const isUSDCEnabled = useIsUSDCEnabled()

  const type =
    isUSDCEnabled && isPremiumContentUSDCPurchaseGated(premiumConditions)
      ? PremiumContentType.USDC_PURCHASE
      : isPremiumContentCollectibleGated(premiumConditions)
      ? PremiumContentType.COLLECTIBLE_GATED
      : PremiumContentType.SPECIAL_ACCESS

  const premiumContentTypeMap = useMemo(() => {
    return {
      [PremiumContentType.COLLECTIBLE_GATED]: {
        icon: IconCollectible,
        color: doesUserHaveAccess && !isOwner ? neutralLight4 : accentBlue,
        text: messages.collectibleGated
      },
      [PremiumContentType.SPECIAL_ACCESS]: {
        icon: IconSpecialAccess,
        color: doesUserHaveAccess && !isOwner ? neutralLight4 : accentBlue,
        text: messages.specialAccess
      },
      [PremiumContentType.USDC_PURCHASE]: {
        icon: IconCart,
        color:
          doesUserHaveAccess && !isOwner ? neutralLight4 : specialLightGreen,
        text: messages.premium
      }
    }
  }, [
    accentBlue,
    doesUserHaveAccess,
    isOwner,
    neutralLight4,
    specialLightGreen
  ])

  const { icon: Icon, color, text } = premiumContentTypeMap[type]

  return (
    <View style={styles.root}>
      <Icon fill={color} height={spacing(4)} width={spacing(4)} />
      <Text fontSize='xs' colorValue={color}>
        {text}
      </Text>
    </View>
  )
}
