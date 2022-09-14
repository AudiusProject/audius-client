import IconNoWifi from 'app/assets/images/iconNoWifi.svg'
import IconRefresh from 'app/assets/images/iconRefresh.svg'
import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'
import { Button, Text, Tile } from 'app/components/core'
import { View } from 'react-native'
import { PullToRefresh } from '../core/PullToRefresh'
import { ScrollView } from 'react-native-gesture-handler'
import { useState, useCallback } from 'react'
import NetInfo from '@react-native-community/netinfo'
import Animated from 'react-native-reanimated'

const useStyles = makeStyles(({ palette, typography }) => ({
  button: {
    marginVertical: spacing(4)
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontByWeight.bold,
    marginVertical: spacing(4)
  },
  icon: {
    height: spacing(4),
    width: spacing(4)
  },
  root: {
    height: '100%'
  },
  tile: {
    display: 'flex',
    padding: spacing(4),
    paddingBottom: spacing(0),
    margin: spacing(3)
  },
  subHeading: {
    fontSize: typography.fontSize.small,
    textAlign: 'center',
    lineHeight: 21
  }
}))

export const OfflinePlaceholder = () => {
  const styles = useStyles()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = useCallback(() => {
    if (isRefreshing) return
    setIsRefreshing(true)
    NetInfo.refresh().then(() => setIsRefreshing(false))
  }, [isRefreshing])

  return (
    <Animated.View style={styles.root}>
      {/* TODO: This doesn't trigger refresh correctly */}
      <PullToRefresh onRefresh={handleRefresh} isRefreshing={isRefreshing} />
      <ScrollView>
        <Tile
          styles={{
            tile: styles.tile
          }}
        >
          <View style={styles.container}>
            <IconNoWifi />
            <Text style={styles.header}>You're Offline</Text>
            <Text style={styles.subHeading}>
              {
                'We Couldn’t Load the Page.\nConnect to the Internet and Try Again.'
              }
            </Text>
            <Button
              title={isRefreshing ? 'Realoding...' : 'Reload'}
              disabled={isRefreshing}
              fullWidth
              icon={IconRefresh}
              iconPosition='left'
              onPress={handleRefresh}
              styles={{ root: styles.button, icon: styles.icon }}
              size='large'
            />
          </View>
        </Tile>
      </ScrollView>
    </Animated.View>
  )
}
