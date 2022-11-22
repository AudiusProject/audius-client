import { useEffect } from 'react'

import { accountSelectors, Status } from '@audius/common'
import type { NavigatorScreenParams } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { setupBackend } from 'audius-client/src/common/store/backend/actions'
import { useDispatch, useSelector } from 'react-redux'
import { useAsync } from 'react-use'

import useAppState from 'app/hooks/useAppState'
import { useUpdateRequired } from 'app/hooks/useUpdateRequired'
import type { AppScreenParamList } from 'app/screens/app-screen'
import { SignOnScreen } from 'app/screens/signon'
import { SplashScreen } from 'app/screens/splash-screen'
import { UpdateRequiredScreen } from 'app/screens/update-required-screen/UpdateRequiredScreen'
import { localStorage } from 'app/services/local-storage'
import { enterBackground, enterForeground } from 'app/store/lifecycle/actions'

import { AppDrawerScreen } from '../app-drawer-screen'

const { getAccountStatus } = accountSelectors

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

  const { value: foundUser } = useAsync(() =>
    localStorage.getCurrentUserExists()
  )

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

  return (
    <>
      <SplashScreen
        canDismiss={
          accountStatus === Status.SUCCESS || accountStatus === Status.ERROR
        }
      />
      {foundUser ? (
        <Stack.Navigator
          screenOptions={{ gestureEnabled: false, headerShown: false }}
        >
          {updateRequired ? (
            <Stack.Screen name='UpdateStack' component={UpdateRequiredScreen} />
          ) : !foundUser ? (
            <Stack.Screen name='SignOnStack' component={SignOnScreen} />
          ) : (
            <Stack.Screen name='HomeStack' component={AppDrawerScreen} />
          )}
        </Stack.Navigator>
      ) : null}
    </>
  )
}
