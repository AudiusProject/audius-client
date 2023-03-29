import { notificationsSelectors } from '@audius/common'
import { View, Text } from 'react-native'
import { useSelector } from 'react-redux'

import { makeStyles } from 'app/styles'

import type { BaseBottomTabBarButtonProps } from './BottomTabBarButton'
import { BottomTabBarButton } from './BottomTabBarButton'

const { getNotificationUnviewedCount } = notificationsSelectors

export type NotificationsButtonProps = BaseBottomTabBarButtonProps

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  notifBubble: {
    position: 'absolute',
    flex: 1,
    right: spacing(5),
    top: spacing(1),
    borderRadius: 99,
    minHeight: spacing(5),
    minWidth: spacing(5),
    backgroundColor: palette.secondary,
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: palette.white
  },
  notifBubbleText: {
    fontFamily: typography.fontByWeight.bold,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    color: palette.staticWhite
  }
}))

export const NotificationsButton = (props: NotificationsButtonProps) => {
  const styles = useStyles()
  const notificationCount = useSelector(getNotificationUnviewedCount)

  return (
    <BottomTabBarButton name='notifications' {...props}>
      {notificationCount > 0 ? (
        <View style={styles.notifBubble}>
          <Text style={styles.notifBubbleText}>
            {notificationCount >= 100 ? '99+' : notificationCount}
          </Text>
        </View>
      ) : null}
    </BottomTabBarButton>
  )
}
