import { useCallback, useState } from 'react'

import { PortalProvider } from '@gorhom/portal'
import * as Sentry from '@sentry/react-native'
import { Platform, UIManager } from 'react-native'
import codePush from 'react-native-code-push'
import Config from 'react-native-config'
import {
  SafeAreaProvider,
  initialWindowMetrics
} from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { useEffectOnce } from 'react-use'
import { PersistGate } from 'redux-persist/integration/react'
import FlipperAsyncStorage from 'rn-flipper-async-storage-advanced'

import { Audio } from 'app/components/audio/Audio'
import HCaptcha from 'app/components/hcaptcha'
import NavigationContainer from 'app/components/navigation-container'
import { NotificationReminder } from 'app/components/notification-reminder/NotificationReminder'
import OAuth from 'app/components/oauth/OAuth'
import { RateCtaReminder } from 'app/components/rate-cta-drawer/RateCtaReminder'
import { Toasts } from 'app/components/toasts'
import { useEnterForeground } from 'app/hooks/useAppState'
import { incrementSessionCount } from 'app/hooks/useSessionCount'
import { RootScreen } from 'app/screens/root-screen'
import { WalletConnectProvider } from 'app/screens/wallet-connect'
import { setLibs } from 'app/services/libs'
import { persistor, store } from 'app/store'
import {
  forceRefreshConnectivity,
  subscribeToNetworkStatusUpdates
} from 'app/utils/reachability'

import { Drawers } from './Drawers'
import ErrorBoundary from './ErrorBoundary'
import { ThemeProvider } from './ThemeProvider'

Sentry.init({
  dsn: Config.SENTRY_DSN
})

const Airplay = Platform.select({
  ios: () => require('../components/audio/Airplay').default,
  android: () => () => null
})?.()

// Need to enable this flag for LayoutAnimation to work on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
  }
}

// Increment the session count when the App.tsx code is first run
incrementSessionCount()

const Modals = () => {
  return <HCaptcha />
}

const App = () => {
  const [
    isPendingMandatoryCodePushUpdate,
    setIsPendingMandatoryCodePushUpdate
  ] = useState(false)

  const codePushSync = useCallback(() => {
    codePush.sync(
      {
        installMode: codePush.InstallMode.ON_NEXT_RESTART,
        mandatoryInstallMode: codePush.InstallMode.ON_NEXT_RESTART
        // ^ We'll manually show the mandatory update UI and prompt the user to restart the app.
      },
      (newStatus) => {
        console.log('New CodePush Status: ', newStatus)
        codePush.getUpdateMetadata(codePush.UpdateState.PENDING).then((res) => {
          if (res != null && res.isMandatory) {
            setIsPendingMandatoryCodePushUpdate(true)
          }
        })
      }
    )
  }, [])

  // Reset libs so that we get a clean app start
  useEffectOnce(() => {
    setLibs(null)
    codePushSync()
  })

  useEffectOnce(() => {
    subscribeToNetworkStatusUpdates()
  })

  useEnterForeground(() => {
    forceRefreshConnectivity()
    codePushSync()
  })

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <FlipperAsyncStorage />
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider>
            <WalletConnectProvider>
              <PortalProvider>
                <ErrorBoundary>
                  <NavigationContainer>
                    <Toasts />
                    <Airplay />
                    <RootScreen
                      isPendingMandatoryCodePushUpdate={
                        isPendingMandatoryCodePushUpdate
                      }
                    />
                    <Drawers />
                    <Modals />
                    <Audio />
                    <OAuth />
                    <NotificationReminder />
                    <RateCtaReminder />
                  </NavigationContainer>
                </ErrorBoundary>
              </PortalProvider>
            </WalletConnectProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  )
}

const AppWithSentry = Sentry.wrap(App)

export { AppWithSentry as App }
