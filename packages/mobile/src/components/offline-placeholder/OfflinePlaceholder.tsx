import { useState, useCallback } from 'react'

import { wait } from '@audius/common'
import NetInfo from '@react-native-community/netinfo'
import { View } from 'react-native'

import IconNoWifi from 'app/assets/images/iconNoWifi.svg'
import IconRefresh from 'app/assets/images/iconRefresh.svg'
import { Button, Text, Tile } from 'app/components/core'
import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'

const useStyles = makeStyles(({ typography }) => ({
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

type OfflinePlaceholderProps = {
  unboxed?: boolean
}

export const OfflinePlaceholder = (props: OfflinePlaceholderProps) => {
  const { unboxed } = props
  const styles = useStyles()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = useCallback(() => {
    if (isRefreshing) return
    setIsRefreshing(true)
    // NetInfo.refresh() usually returns almost instantly
    // Introduce minimum wait to convince user we took action
    Promise.all([NetInfo.refresh(), wait(800)]).then(() =>
      setIsRefreshing(false)
    )
  }, [isRefreshing])

  const body = (
    <View style={styles.container}>
      <IconNoWifi />
      <Text style={styles.header}>You&apos;re Offline</Text>
      <Text style={styles.subHeading}>
        {'We Couldn’t Load the Page.\nConnect to the Internet and Try Again.'}
      </Text>
      <Button
        title={isRefreshing ? 'Reloading...' : 'Reload'}
        disabled={isRefreshing}
        fullWidth
        icon={IconRefresh}
        iconPosition='left'
        onPress={handleRefresh}
        styles={{ root: styles.button, icon: styles.icon }}
        size='large'
      />
    </View>
  )

  return unboxed ? (
    <View style={styles.root}>{body}</View>
  ) : (
    <Tile
      styles={{
        tile: styles.root
      }}
    >
      {body}
    </Tile>
  )
}
