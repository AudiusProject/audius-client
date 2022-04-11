import { useCallback, useContext, useMemo } from 'react'

import { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { CardStyleInterpolators } from '@react-navigation/stack'
import { markAllAsViewed } from 'audius-client/src/common/store/notifications/actions'
import { getNotificationUnreadCount } from 'audius-client/src/common/store/notifications/selectors'
import { Text, View } from 'react-native'

import AudiusLogo from 'app/assets/images/audiusLogoHorizontal.svg'
import IconCaretRight from 'app/assets/images/iconCaretRight.svg'
import IconNotification from 'app/assets/images/iconNotification.svg'
import IconSearch from 'app/assets/images/iconSearch.svg'
import { IconButton } from 'app/components/core'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useNavigation } from 'app/hooks/useNavigation'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { NotificationsDrawerNavigationContext } from 'app/screens/notifications-screen/NotificationsDrawerNavigationContext'
import { makeStyles } from 'app/styles'
import { formatCount } from 'app/utils/format'
import { useThemeColors } from 'app/utils/theme'

import { AppScreenParamList } from './AppScreen'
import { AppTabScreenParamList } from './AppTabScreen'

const useStyles = makeStyles(({ palette, spacing, typography }) => ({
  headerLeft: { marginLeft: -1 * spacing(2), width: 40 },
  headerRight: {},
  title: {
    fontSize: 18,
    fontFamily: typography.fontByWeight.heavy,
    color: palette.neutralLight5,
    textTransform: 'uppercase'
  },
  iconNotification: {
    height: 28,
    width: 28
  },
  notificationCount: {
    position: 'absolute',
    left: 14,
    borderRadius: 8,
    backgroundColor: palette.accentRed,
    paddingHorizontal: 6
  },
  notificationCountText: {
    fontFamily: typography.fontByWeight.bold,
    fontSize: 11,
    textAlign: 'center',
    color: palette.staticWhite
  },
  iconArrowBack: {
    height: 28,
    width: 28,
    transform: [{ rotate: '180deg' }]
  },
  audiusLogo: {
    height: 24,
    width: 93,
    marginRight: 10
  },
  iconSearch: {
    height: 18,
    width: 18
  }
}))

export const useAppScreenOptions = () => {
  const styles = useStyles()
  const { accentOrangeLight1, neutralLight4 } = useThemeColors()
  const dispatchWeb = useDispatchWeb()
  const notificationCount = useSelectorWeb(getNotificationUnreadCount)
  const navigation = useNavigation<
    AppScreenParamList & AppTabScreenParamList['Search']
  >()
  const { drawerNavigation } = useContext(NotificationsDrawerNavigationContext)

  const handlePressNotification = useCallback(() => {
    drawerNavigation?.openDrawer()
    dispatchWeb(markAllAsViewed())
  }, [dispatchWeb, drawerNavigation])

  const handlePressHome = useCallback(() => {
    navigation.navigate({
      native: { screen: 'trending', params: undefined },
      web: { route: 'trending' }
    })
  }, [navigation])

  const handlePressSearch = useCallback(() => {
    navigation.push({
      native: { screen: 'Search', params: undefined }
    })
  }, [navigation])

  const goBack = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const screenOptions: NativeStackNavigationOptions = useMemo(
    () => ({
      fullScreenGestureEnabled: true,
      detachPreviousScreen: false,
      cardOverlayEnabled: true,
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      headerShadowVisible: false,
      headerLeft: props => {
        const { canGoBack, ...other } = props
        if (canGoBack) {
          return (
            <View style={styles.headerLeft}>
              <IconButton
                icon={IconCaretRight}
                fill={neutralLight4}
                styles={{ icon: styles.iconArrowBack }}
                {...other}
                onPress={goBack}
              />
            </View>
          )
        }
        return (
          <View style={styles.headerLeft}>
            <IconButton
              icon={IconNotification}
              styles={{ icon: styles.iconNotification }}
              fill={notificationCount > 0 ? accentOrangeLight1 : neutralLight4}
              onPress={handlePressNotification}
            />
            {notificationCount > 0 ? (
              <View style={styles.notificationCount}>
                <Text style={styles.notificationCountText}>
                  {formatCount(notificationCount)}
                </Text>
              </View>
            ) : null}
          </View>
        )
      },
      title: '',
      headerTitle: ({ children }) => {
        if (children === 'none') return null
        if (children) {
          return (
            <Text style={styles.title} accessibilityRole='header'>
              {children}
            </Text>
          )
        }
        return (
          <IconButton
            icon={AudiusLogo}
            fill={neutralLight4}
            styles={{ icon: styles.audiusLogo }}
            onPress={handlePressHome}
          />
        )
      },
      headerRightContainerStyle: styles.headerRight,
      headerRight: () => {
        return (
          <View style={styles.headerRight}>
            <IconButton
              icon={IconSearch}
              fill={neutralLight4}
              styles={{ icon: styles.iconSearch }}
              onPress={handlePressSearch}
            />
          </View>
        )
      }
    }),
    [
      handlePressNotification,
      handlePressHome,
      handlePressSearch,
      styles,
      neutralLight4,
      accentOrangeLight1,
      notificationCount
    ]
  )

  return screenOptions
}
