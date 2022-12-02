import { useEffect } from 'react'

import { accountSelectors, Status } from '@audius/common'
import type { NavigatorScreenParams } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { setupBackend } from 'audius-client/src/common/store/backend/actions'
import { Platform } from 'react-native'
import { SystemBars } from 'react-native-bars'
import * as BootSplash from 'react-native-bootsplash'
import { useDispatch, useSelector } from 'react-redux'

import useAppState from 'app/hooks/useAppState'
import { useUpdateRequired } from 'app/hooks/useUpdateRequired'
import type { AppScreenParamList } from 'app/screens/app-screen'
import { SignOnScreen } from 'app/screens/signon'
import { SplashScreen } from 'app/screens/splash-screen'
import { UpdateRequiredScreen } from 'app/screens/update-required-screen/UpdateRequiredScreen'
import { enterBackground, enterForeground } from 'app/store/lifecycle/actions'
import { Theme, useThemeVariant } from 'app/utils/theme'

import { AppDrawerScreen } from '../app-drawer-screen'

const { getAccountStatus, getHasAccount } = accountSelectors

const IS_IOS = Platform.OS === 'ios'

export type RootScreenParamList = {
  HomeStack: NavigatorScreenParams<{
    App: NavigatorScreenParams<AppScreenParamList>
  }>
}

const Stack = createNativeStackNavigator()

type RootScreenProps = {
  isReadyToSetupBackend: boolean
}

/**
 * The top level navigator. Switches between sign on screens and main tab navigator
 * based on if the user is authed
 */
export const RootScreen = ({ isReadyToSetupBackend }: RootScreenProps) => {
  const dispatch = useDispatch()
  const accountStatus = useSelector(getAccountStatus)
  const { updateRequired } = useUpdateRequired()
  const hasAccount = useSelector(getHasAccount)

  useEffect(() => {
    // Setup the backend when ready
    if (isReadyToSetupBackend) {
      dispatch(setupBackend())
    }
  }, [dispatch, isReadyToSetupBackend])

  useAppState(
    () => dispatch(enterForeground()),
    () => dispatch(enterBackground())
  )

  const theme = useThemeVariant()

  const accountFetchResolved =
    accountStatus === Status.SUCCESS || accountStatus === Status.ERROR

  // Android does not use the SplashScreen component as different
  // devices will render different sizes of the BootSplash.
  // Instead of our custom SplashScreen, fade out the BootSplash screen.
  useEffect(() => {
    if (accountFetchResolved && !IS_IOS) {
      BootSplash.hide({ fade: true })
    }
  }, [accountFetchResolved])

  // Status & nav bar content (the buttons) should be light while in a dark theme or
  // the splash screen is still visible (it's purple and white-on-purple looks better)
  const barStyle =
    theme === Theme.DARK ||
    theme === Theme.MATRIX ||
    (IS_IOS && !accountFetchResolved)
      ? 'light-content'
      : 'dark-content'

  return (
    <>
      {!IS_IOS ? <SystemBars animated barStyle={barStyle} /> : null}
      {IS_IOS ? <SplashScreen canDismiss={accountFetchResolved} /> : null}
      <Stack.Navigator
        screenOptions={{ gestureEnabled: false, headerShown: false }}
      >
        {updateRequired ? (
          <Stack.Screen name='UpdateStack' component={UpdateRequiredScreen} />
        ) : accountFetchResolved && !hasAccount ? (
          <Stack.Screen name='SignOnStack' component={SignOnScreen} />
        ) : (
          <Stack.Screen name='HomeStack' component={AppDrawerScreen} />
        )}
      </Stack.Navigator>
    </>
  )
}
