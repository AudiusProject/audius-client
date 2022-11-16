import { memo, useMemo, useState } from 'react'

import { createDrawerNavigator } from '@react-navigation/drawer'
// eslint-disable-next-line import/no-unresolved
import type { DrawerNavigationHelpers } from '@react-navigation/drawer/lib/typescript/src/types'
import { useNavigation } from '@react-navigation/native'
import { Dimensions } from 'react-native'

import { AccountDrawer } from '../account-screen'
import { AppScreen } from '../app-screen'

import { AppDrawerContextProvider } from './AppDrawerContext'

const SCREEN_WIDTH = Dimensions.get('window').width

const Drawer = createDrawerNavigator()

type AppTabScreenProps = {
  navigation: DrawerNavigationHelpers
  gesturesDisabled: boolean
  setGesturesDisabled: (gesturesDisabled: boolean) => void
}

/**
 * The app stack after signing up or signing in
 */
const AppStack = memo(function AppStack(props: AppTabScreenProps) {
  const {
    navigation: drawerHelpers,
    gesturesDisabled,
    setGesturesDisabled
  } = props
  const drawerNavigation = useNavigation()
  return (
    <AppDrawerContextProvider
      drawerNavigation={drawerNavigation}
      drawerHelpers={drawerHelpers}
      gesturesDisabled={gesturesDisabled}
      setGesturesDisabled={setGesturesDisabled}
    >
      <AppScreen />
    </AppDrawerContextProvider>
  )
})

export const AppDrawerScreen = () => {
  const [gesturesDisabled, setGesturesDisabled] = useState(false)

  const drawerScreenOptions = useMemo(
    () => ({
      headerShown: false,
      swipeEdgeWidth: SCREEN_WIDTH,
      drawerType: 'front' as const,
      drawerStyle: { width: '75%' },
      gestureHandlerProps: { enabled: !gesturesDisabled }
    }),
    [gesturesDisabled]
  )

  const gestureProps = { gesturesDisabled, setGesturesDisabled }

  return (
    <Drawer.Navigator
      // legacy implementation uses reanimated-v1
      useLegacyImplementation={true}
      screenOptions={drawerScreenOptions}
      drawerContent={(props) => <AccountDrawer {...gestureProps} {...props} />}
    >
      <Drawer.Screen name='App'>
        {(props) => <AppStack {...props} {...gestureProps} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  )
}
