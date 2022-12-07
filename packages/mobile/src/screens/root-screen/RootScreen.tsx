import { useEffect, useState } from 'react'

import { accountSelectors, Status } from '@audius/common'
import { getHasAccount } from '@audius/common/dist/store/account/selectors'
import type { NavigatorScreenParams } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { setupBackend } from 'audius-client/src/common/store/backend/actions'
import { Platform } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import useAppState from 'app/hooks/useAppState'
import { useUpdateRequired } from 'app/hooks/useUpdateRequired'
import type { AppScreenParamList } from 'app/screens/app-screen'
import { SignOnScreen } from 'app/screens/signon'
import { SplashScreen } from 'app/screens/splash-screen'
import { UpdateRequiredScreen } from 'app/screens/update-required-screen/UpdateRequiredScreen'
import { enterBackground, enterForeground } from 'app/store/lifecycle/actions'

import { AppDrawerScreen } from '../app-drawer-screen'

import { ThemedStatusBar } from './StatusBar'

const { getAccountStatus } = accountSelectors

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
  const hasAccount = useSelector(getHasAccount)
  const { updateRequired } = useUpdateRequired()
  const [isLoaded, setIsLoaded] = useState(false)

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

  useEffect(() => {
    if (
      !isLoaded &&
      (accountStatus === Status.SUCCESS || accountStatus === Status.ERROR)
    ) {
      setIsLoaded(true)
    }
  }, [accountStatus, setIsLoaded, isLoaded])

  return (
    <>
      {IS_IOS ? (
        <SplashScreen canDismiss={isLoaded} />
      ) : (
        <ThemedStatusBar isAppLoaded={isLoaded} accountStatus={accountStatus} />
      )}

      {isLoaded ? (
        <Stack.Navigator
          screenOptions={{ gestureEnabled: false, headerShown: false }}
        >
          {updateRequired ? (
            <Stack.Screen name='UpdateStack' component={UpdateRequiredScreen} />
          ) : hasAccount ? (
            <Stack.Screen name='HomeStack' component={AppDrawerScreen} />
          ) : (
            <Stack.Screen name='SignOnStack' component={SignOnScreen} />
          )}
        </Stack.Navigator>
      ) : null}
    </>
  )
}
