import type { RefObject } from 'react'
import { useEffect } from 'react'

import { useNetInfo } from '@react-native-community/netinfo'

import { MessageType } from 'app/message'
import type { MessagePostingWebView } from 'app/types/MessagePostingWebView'
import { checkConnectivity } from 'app/utils/connectivity'
import { postMessage } from 'app/utils/postMessage'

type ConnectivityProps = {
  webRef: RefObject<MessagePostingWebView>
}

const useConnectivity = ({ webRef }: ConnectivityProps) => {
  const netInfo = useNetInfo()
  console.debug('Received updated net info', JSON.stringify(netInfo))

  useEffect(() => {
    const { current } = webRef
    const isConnected = checkConnectivity(netInfo)
    if (current) {
      postMessage(current, {
        type: MessageType.IS_NETWORK_CONNECTED,
        isConnected,
        isAction: true
      })
    }
  }, [netInfo, webRef])
}

export default useConnectivity
