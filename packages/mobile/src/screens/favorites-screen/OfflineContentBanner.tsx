import { reachabilitySelectors } from '@audius/common'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

import IconNoWifi from 'app/assets/images/iconNoWifiSmall.svg'
import { Text, Tile } from 'app/components/core'
import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'
import { makeStyles } from 'app/styles'
const { getIsReachable } = reachabilitySelectors

const messages = {
  displayingOfflineContent: 'Displaying Available Offline Content'
}

const useStyles = makeStyles(({ typography, spacing, palette }) => ({
  container: {
    flexDirection: 'row',
    paddingVertical: spacing(4)
  },
  tile: {
    margin: spacing(3),
    marginBottom: spacing(0)
  },
  iconRoot: {
    alignSelf: 'center',
    paddingHorizontal: spacing(4)
  },
  icon: {
    height: 32,
    width: 32
  },
  text: {
    flexShrink: 1,
    fontSize: typography.fontSize.medium,
    lineHeight: 24,
    color: palette.neutral
  }
}))

export const OfflineContentBanner = () => {
  const styles = useStyles()
  const isOfflineModeEnabled = useIsOfflineModeEnabled()
  const isReachable = useSelector(getIsReachable)
  if (!isOfflineModeEnabled || isReachable) return null
  return (
    <View>
      <Tile style={styles.tile}>
        <View style={styles.container}>
          <View style={styles.iconRoot}>
            <IconNoWifi style={styles.icon} />
          </View>
          <Text style={styles.text}>{messages.displayingOfflineContent}</Text>
        </View>
      </Tile>
    </View>
  )
}
