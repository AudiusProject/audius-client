import { createContext, ReactNode } from 'react'

import {
  createDrawerNavigator,
  DrawerContentComponentProps
} from '@react-navigation/drawer'
import { NavigatorScreenParams } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { useSelector } from 'react-redux'

import { AppScreen, AppScreenParamList } from 'app/screens/app-screen'
import { SignOnScreen } from 'app/screens/signon'
import {
  getDappLoaded,
  getIsSignedIn,
  getOnSignUp
} from 'app/store/lifecycle/selectors'
import { getAccountAvailable } from 'app/store/signon/selectors'

import { NotificationsScreen } from '../notifications-screen/NotificationsScreen'

export type RootScreenParamList = {
  signOn: undefined
  App: NavigatorScreenParams<AppScreenParamList>
}

type DrawerNavigationContextProps = {
  drawerNavigation: any
}

export const DrawerNavigationContext = createContext<
  DrawerNavigationContextProps
>({
  drawerNavigation: null
})

const DrawerNavigationContextProvider = ({
  drawerNavigation,
  children
}: {
  drawerNavigation: any
  children: ReactNode
}) => {
  return (
    <DrawerNavigationContext.Provider
      value={{
        drawerNavigation
      }}
    >
      {children}
    </DrawerNavigationContext.Provider>
  )
}

const Drawer = createDrawerNavigator()
const Stack = createStackNavigator()

const MainStack = ({ navigation }) => {
  return (
    <DrawerNavigationContextProvider drawerNavigation={navigation}>
      <Stack.Navigator
        screenOptions={{ gestureEnabled: false, headerShown: false }}
      >
        <Stack.Screen name='MainStack' component={AppScreen} />
      </Stack.Navigator>
    </DrawerNavigationContextProvider>
  )
}

const DrawerContents = ({ navigation }: DrawerContentComponentProps) => {
  return (
    <DrawerNavigationContextProvider drawerNavigation={navigation}>
      <NotificationsScreen />
    </DrawerNavigationContextProvider>
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

  const isAuthed =
    !dappLoaded ||
    signedIn === null ||
    (signedIn && !onSignUp) ||
    isAccountAvailable

  return isAuthed ? (
    <Drawer.Navigator
      screenOptions={{
        drawerType: 'slide',
        headerShown: false,
        drawerStyle: {
          width: '100%'
        }
      }}
      drawerContent={DrawerContents}
    >
      <Drawer.Screen name='App' component={MainStack} />
    </Drawer.Navigator>
  ) : (
    <Stack.Navigator
      screenOptions={{ gestureEnabled: false, headerShown: false }}
    >
      <Stack.Screen name='SignOnStack' component={SignOnScreen} />
    </Stack.Navigator>
  )
}
