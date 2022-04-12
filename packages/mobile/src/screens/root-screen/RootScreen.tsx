import {
  createDrawerNavigator,
  DrawerContentComponentProps
} from '@react-navigation/drawer'
import { DrawerNavigationHelpers } from '@react-navigation/drawer/lib/typescript/src/types'
import { NavigatorScreenParams } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Dimensions } from 'react-native'
import { useSelector } from 'react-redux'

import { AppScreen, AppScreenParamList } from 'app/screens/app-screen'
import { SignOnScreen } from 'app/screens/signon'
import {
  getDappLoaded,
  getIsSignedIn,
  getOnSignUp
} from 'app/store/lifecycle/selectors'
import { getAccountAvailable } from 'app/store/signon/selectors'

import { NotificationsDrawerNavigationContextProvider } from '../notifications-screen/NotificationsDrawerNavigationContext'
import { NotificationsScreen } from '../notifications-screen/NotificationsScreen'

export type RootScreenParamList = {
  signOn: undefined
  App: NavigatorScreenParams<{
    MainStack: NavigatorScreenParams<AppScreenParamList>
  }>
}

const SCREEN_WIDTH = Dimensions.get('window').width

const Drawer = createDrawerNavigator()
const Stack = createNativeStackNavigator()

/**
 * The sign up & sign in stack when not authenticated
 */
const SignOnStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ gestureEnabled: false, headerShown: false }}
    >
      <Stack.Screen name='SignOnStack' component={SignOnScreen} />
    </Stack.Navigator>
  )
}

/**
 * The main stack after signing up or signing in
 */
const MainStack = ({ navigation }: { navigation: DrawerNavigationHelpers }) => {
  return (
    <NotificationsDrawerNavigationContextProvider drawerNavigation={navigation}>
      <Stack.Navigator
        screenOptions={{ gestureEnabled: false, headerShown: false }}
      >
        <Stack.Screen name='MainStack' component={AppScreen} />
      </Stack.Navigator>
    </NotificationsDrawerNavigationContextProvider>
  )
}

/**
 * The contents of the notifications drawer, which swipes in
 */
const NotificationsDrawerContents = ({
  navigation
}: DrawerContentComponentProps) => {
  return (
    <NotificationsDrawerNavigationContextProvider drawerNavigation={navigation}>
      <NotificationsScreen />
    </NotificationsDrawerNavigationContextProvider>
  )
}

/**
 * The top level navigator. Switches between sign on screens and main tab navigator
 * based on if the user is authed
 */
export const RootScreen = () => {
  const dappLoaded = useSelector(getDappLoaded)
  const signedIn = useSelector(getIsSignedIn)
  const onSignUp = useSelector(getOnSignUp)
  const isAccountAvailable = useSelector(getAccountAvailable)

  // This check is overly complicated and should probably just check `signedIn`.
  // However, this allows the feed screen to load initially so that when the
  // splash screen disappears there is already content (skeletons) on the screen
  const isAuthed =
    !dappLoaded ||
    signedIn === null ||
    (signedIn && !onSignUp) ||
    isAccountAvailable

  return isAuthed ? (
    <Drawer.Navigator
      // legacy implementation uses reanimated-v1
      useLegacyImplementation={true}
      detachInactiveScreens={false}
      screenOptions={{
        drawerType: 'slide',
        headerShown: false,
        drawerStyle: {
          width: '100%'
        },
        swipeEdgeWidth: SCREEN_WIDTH
      }}
      drawerContent={NotificationsDrawerContents}
    >
      <Drawer.Screen name='App' component={MainStack} />
    </Drawer.Navigator>
  ) : (
    <SignOnStack />
  )
}
