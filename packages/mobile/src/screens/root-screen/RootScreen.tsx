import { useEffect, useState } from 'react'

import { accountSelectors, Status } from '@audius/common'
import type { NavigatorScreenParams } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import {
  getStartedSignUpProcess,
  getFinishedSignUpProcess
} from 'common/store/pages/signon/selectors'
import { Pages } from 'common/store/pages/signon/types'
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

const { getAccountStatus, getHasAccount } = accountSelectors

const IS_IOS = Platform.OS === 'ios'

export type RootScreenParamList = {
  HomeStack: NavigatorScreenParams<{
    App: NavigatorScreenParams<AppScreenParamList>
  }>
}

const Stack = createNativeStackNavigator()

const useShowHomeStack = () => {
  const hasAccount = useSelector(getHasAccount)
  const startedSignUpProcess = useSelector(getStartedSignUpProcess)
  const finishedSignUpProcess = useSelector(getFinishedSignUpProcess)

  // Show HomeStack if user has an account and
  // they have finished the sign up process if they started
  return hasAccount && (!startedSignUpProcess || finishedSignUpProcess)
}

/**
 * The top level navigator. Switches between sign on screens and main tab navigator
 * based on if the user is authed
 */
export const RootScreen = () => {
  const dispatch = useDispatch()
  const accountStatus = useSelector(getAccountStatus)
  const showHomeStack = useShowHomeStack()
  const { updateRequired } = useUpdateRequired()
  const [isLoaded, setIsLoaded] = useState(false)

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
          ) : showHomeStack ? (
            <Stack.Screen name='HomeStack' component={AppDrawerScreen} />
          ) : (
            <Stack.Screen name='SignOnStack' component={SignOnScreen} />
          )}
        </Stack.Navigator>
      ) : null}
    </>
  )
}
