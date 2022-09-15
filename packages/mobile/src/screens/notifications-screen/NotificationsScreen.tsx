import { memo, useEffect } from 'react'

import { notificationsActions, reachabilitySelectors } from '@audius/common'
import { useDrawerStatus } from '@react-navigation/drawer'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { usePrevious } from 'react-use'
import { OfflinePlaceholder } from 'app/components/offline-placeholder'

import { makeStyles } from 'app/styles'

import { NotificationList } from './NotificationList'
import { TopBar } from './TopBar'
const { getIsReachable } = reachabilitySelectors
const { markAllAsViewed } = notificationsActions

const useStyles = makeStyles(({ palette }) => ({
  root: {
    backgroundColor: palette.background,
    height: '100%'
  }
}))

/**
 * Memoized to prevent rerender during bottom-bar navigation.
 * It's rerendering because navigation context changes.
 */
export const NotificationsScreen = memo(() => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const isDrawerOpen = useDrawerStatus() === 'open'
  const wasDrawerOpen = usePrevious(isDrawerOpen)
  const isNotReachable = useSelector(getIsReachable) === false

  useEffect(() => {
    if (wasDrawerOpen && !isDrawerOpen) {
      dispatch(markAllAsViewed())
    }
  }, [isDrawerOpen, wasDrawerOpen, dispatch])

  return (
    <View style={styles.root}>
      <TopBar />
      {isNotReachable ? <OfflinePlaceholder /> : <NotificationList />}
    </View>
  )
})
