import { PortalProvider } from '@gorhom/portal'
import * as Sentry from '@sentry/react-native'
import { Platform, UIManager } from 'react-native'
import Config from 'react-native-config'
import {
  SafeAreaProvider,
  initialWindowMetrics
} from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { useEffectOnce } from 'react-use'
import FlipperAsyncStorage from 'rn-flipper-async-storage-advanced'

import { Audio } from 'app/components/audio/Audio'
import HCaptcha from 'app/components/hcaptcha'
import NavigationContainer from 'app/components/navigation-container'
import { NotificationReminder } from 'app/components/notification-reminder/NotificationReminder'
import OAuth from 'app/components/oauth/OAuth'
import { OfflineDownloader } from 'app/components/offline-downloads/OfflineDownloader'
import { RateCtaReminder } from 'app/components/rate-cta-drawer/RateCtaReminder'
import { ToastContextProvider } from 'app/components/toast/ToastContext'
import { useEnterForeground } from 'app/hooks/useAppState'
import { incrementSessionCount } from 'app/hooks/useSessionCount'
import { RootScreen } from 'app/screens/root-screen'
import { WalletConnectProvider } from 'app/screens/wallet-connect'
import { setLibs } from 'app/services/libs'
import { store } from 'app/store'
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
  // Reset libs so that we get a clean app start
  useEffectOnce(() => {
    setLibs(null)
  })

  useEffectOnce(() => {
    subscribeToNetworkStatusUpdates()
  })

  useEnterForeground(() => {
    forceRefreshConnectivity()
  })

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <FlipperAsyncStorage />
      <Provider store={store}>
        <ThemeProvider>
          <WalletConnectProvider>
            <PortalProvider>
              <ToastContextProvider>
                <ErrorBoundary>
                  <NavigationContainer>
                    <Airplay />
                    <RootScreen />
                    <Drawers />
                    <Modals />
                    <Audio />
                    <OAuth />
                    <NotificationReminder />
                    <RateCtaReminder />
                    <OfflineDownloader />
                  </NavigationContainer>
                </ErrorBoundary>
              </ToastContextProvider>
            </PortalProvider>
          </WalletConnectProvider>
        </ThemeProvider>
      </Provider>
    </SafeAreaProvider>
  )
}

const AppWithSentry = Sentry.wrap(App)

export { AppWithSentry as App }
