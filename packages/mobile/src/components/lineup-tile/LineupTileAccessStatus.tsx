import type { ID } from '@audius/common'
import { premiumContentSelectors } from '@audius/common'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

import IconLock from 'app/assets/images/iconLock.svg'
import { Text } from 'app/components/core'
import LoadingSpinner from 'app/components/loading-spinner'
import { flexRowCentered, makeStyles } from 'app/styles'
import { useColor } from 'app/utils/theme'

const { getPremiumTrackStatusMap } = premiumContentSelectors

const messages = {
  unlocking: 'Unlocking',
  locked: 'Locked'
}

const useStyles = makeStyles(({ palette, spacing, typography }) => ({
  root: {
    ...flexRowCentered(),
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(3),
    backgroundColor: palette.accentBlue,
    borderRadius: spacing(1),
    gap: spacing(1)
  },
  text: {
    fontFamily: typography.fontByWeight.bold,
    fontSize: typography.fontSize.small,
    color: palette.staticWhite
  }
}))

export const LineupTileAccessStatus = ({ trackId }: { trackId: ID }) => {
  const styles = useStyles()
  const premiumTrackStatusMap = useSelector(getPremiumTrackStatusMap)
  const premiumTrackStatus = premiumTrackStatusMap[trackId]
  const staticwhite = useColor('staticWhite')

  return (
    <View style={styles.root}>
      {premiumTrackStatus === 'UNLOCKING' ? (
        <LoadingSpinner />
      ) : (
        <IconLock fill={staticwhite} width={16} height={16} />
      )}
      <Text style={styles.text}>
        {premiumTrackStatus === 'UNLOCKING'
          ? messages.unlocking
          : messages.locked}
      </Text>
    </View>
  )
}
