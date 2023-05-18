import { useCallback, useEffect, useState } from 'react'

import { accountSelectors, chatActions, Status } from '@audius/common'
import type { NavigatorScreenParams } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { getHasCompletedAccount } from 'common/store/pages/signon/selectors'
import { useDispatch, useSelector } from 'react-redux'

import useAppState from 'app/hooks/useAppState'
import { useUpdateRequired } from 'app/hooks/useUpdateRequired'
import type { AppScreenParamList } from 'app/screens/app-screen'
import { SignOnScreen } from 'app/screens/signon'
import { SplashScreen } from 'app/screens/splash-screen'
import {
  UpdateRequiredScreen,
  RestartRequiredScreen
} from 'app/screens/update-required-screen'
import { enterBackground, enterForeground } from 'app/store/lifecycle/actions'

import { AppDrawerScreen } from '../app-drawer-screen'

import { StatusBar } from './StatusBar'

const { getAccountStatus } = accountSelectors
const { fetchMoreChats, fetchUnreadMessagesCount, connect, disconnect } =
  chatActions

export type RootScreenParamList = {
  HomeStack: NavigatorScreenParams<{
    App: NavigatorScreenParams<AppScreenParamList>
  }>
}

const Stack = createNativeStackNavigator()

type RootScreenProps = {
  isPendingMandatoryCodePushUpdate?: boolean
}

/**
 * The top level navigator. Switches between sign on screens and main tab navigator
 * based on if the user is authed
 */
export const RootScreen = ({
  isPendingMandatoryCodePushUpdate
}: RootScreenProps) => {
  const dispatch = useDispatch()
  const accountStatus = useSelector(getAccountStatus)
  const showHomeStack = useSelector(getHasCompletedAccount)
  const { updateRequired: appUpdateRequired } = useUpdateRequired()
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSplashScreenDismissed, setIsSplashScreenDismissed] = useState(false)

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

  // Connect to chats websockets and prefetch chats
  useEffect(() => {
    if (isLoaded && accountStatus === Status.SUCCESS) {
      dispatch(connect())
      dispatch(fetchMoreChats())
      dispatch(fetchUnreadMessagesCount())
    }
    return () => {
      dispatch(disconnect())
    }
  }, [dispatch, isLoaded, accountStatus])

  const handleSplashScreenDismissed = useCallback(() => {
    setIsSplashScreenDismissed(true)
  }, [])

  return (
    <>
      <SplashScreen
        canDismiss={isLoaded}
        onDismiss={handleSplashScreenDismissed}
      />
      <StatusBar
        isAppLoaded={isLoaded}
        isSplashScreenDismissed={isSplashScreenDismissed}
      />
      {isLoaded ? (
        <Stack.Navigator
          screenOptions={{ gestureEnabled: false, headerShown: false }}
        >
          {appUpdateRequired || isPendingMandatoryCodePushUpdate ? (
            <Stack.Screen
              name='UpdateStack'
              component={
                appUpdateRequired ? UpdateRequiredScreen : RestartRequiredScreen
              }
            />
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
