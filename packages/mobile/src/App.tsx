import { useRef, useEffect } from 'react'

import { PortalProvider } from '@gorhom/portal'
import * as Sentry from '@sentry/react-native'
import { Platform, UIManager } from 'react-native'
import Config from 'react-native-config'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import type WebView from 'react-native-webview'
import { Provider } from 'react-redux'

import Audio from 'app/components/audio/Audio'
import HCaptcha from 'app/components/hcaptcha'
import NavigationContainer from 'app/components/navigation-container'
import OAuth from 'app/components/oauth/OAuth'
import { ReachabilityBar } from 'app/components/reachability-bar'
import { ThemeProvider } from 'app/components/theme/ThemeContext'
import { ToastContextProvider } from 'app/components/toast/ToastContext'
import { incrementSessionCount } from 'app/hooks/useSessionCount'
import PushNotifications from 'app/notifications'
import { RootScreen } from 'app/screens/root-screen'
import { store } from 'app/store'

import { Drawers } from './Drawers'
import ErrorBoundary from './ErrorBoundary'

Sentry.init({
  dsn: Config.SENTRY_DSN
})

const Airplay = Platform.select({
  ios: () => require('./components/audio/Airplay').default,
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
  // Track the web view as a top-level ref so that any children can use it
  // to send messages to the dapp
  const webRef = useRef<WebView>(null)

  // Configure push notifications so that it has access to the web view
  // and can message pass to it
  useEffect(() => {
    PushNotifications.setWebRef(webRef)
  }, [webRef])

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PortalProvider>
          <ToastContextProvider>
            <ErrorBoundary>
              <ThemeProvider>
                <NavigationContainer>
                  <Airplay />
                  <ReachabilityBar />
                  <RootScreen />
                  <Drawers />
                  <Modals />
                  <Audio webRef={webRef} />
                  <OAuth webRef={webRef} />
                </NavigationContainer>
              </ThemeProvider>
            </ErrorBoundary>
          </ToastContextProvider>
        </PortalProvider>
      </Provider>
    </SafeAreaProvider>
  )
}

export default Sentry.wrap(App)
