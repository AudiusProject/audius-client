import { getErrorMessage } from '@audius/common'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { NativeSyntheticEvent } from 'react-native'
import { View } from 'react-native'
import Config from 'react-native-config'
import StaticServer from 'react-native-static-server'
import { WebView } from 'react-native-webview'
import type { WebViewMessage } from 'react-native-webview/lib/WebViewTypes'
import { useAsync } from 'react-use'

import { ENTROPY_KEY } from 'app/store/account/sagas'

const OLD_WEB_APP_STATIC_SERVER_PORT = Config.OLD_WEB_APP_STATIC_SERVER_PORT

const injected = `
(function() {
  const entropy = window.localStorage.getItem('${ENTROPY_KEY}')
  window.ReactNativeWebView.postMessage(
    JSON.stringify({
      test: 'hello world',
      entropy
    })
  )
})();
`

type WebAppAccountSyncProps = {
  setIsReadyToSetupBackend: (isReadyToSetupBackend: boolean) => void
}

/**
 * Used to sync the entropy from the legacy WebView to AsyncStorage
 * so that users don't need to sign in again
 *
 * This can be removed when a reasonable amount of time has passed
 */
export const WebAppAccountSync = (props: WebAppAccountSyncProps) => {
  const { setIsReadyToSetupBackend } = props

  const { value: uri, error } = useAsync(async () => {
    const server = new StaticServer(OLD_WEB_APP_STATIC_SERVER_PORT, {
      localOnly: true,
      keepAlive: true
    })

    return await server.start()
  }, [])

  if (error) {
    console.error(
      'WebAppAccountSync Error -- StaticServer: ',
      getErrorMessage(error)
    )
  }

  const onMessageHandler = async (
    event: NativeSyntheticEvent<WebViewMessage>
  ) => {
    try {
      if (event.nativeEvent.data) {
        const { entropy } = JSON.parse(event.nativeEvent.data)
        if (entropy) {
          await AsyncStorage.setItem(ENTROPY_KEY, entropy)
        }
        // Once the check for entropy is complete
        // the backend setup can begin
        setIsReadyToSetupBackend(true)
      }
    } catch (e) {
      console.error(
        'WebAppAcountSync Error -- onMessageHandler: ',
        getErrorMessage(e)
      )
      // do nothing
    }
  }

  return uri ? (
    <View style={{ display: 'none' }}>
      <WebView
        injectedJavaScript={injected}
        onMessage={onMessageHandler}
        source={{ uri }}
      />
    </View>
  ) : null
}
