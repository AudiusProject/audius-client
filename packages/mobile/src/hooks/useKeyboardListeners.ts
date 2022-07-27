import type { RefObject } from 'react'
import { useEffect } from 'react'

import { Keyboard } from 'react-native'
import type { WebView } from 'react-native-webview'

import { MessageType } from '../message'
import { postMessage } from '../utils/postMessage'

export const useKeyboardListeners = (webRef: RefObject<WebView>) => {
  useEffect(() => {
    const didShowListener = Keyboard.addListener('keyboardDidShow', () => {
      if (webRef.current) {
        postMessage(webRef.current, {
          type: MessageType.KEYBOARD_VISIBLE,
          isAction: true
        })
      }
    })

    const didHideListener = Keyboard.addListener('keyboardDidHide', () => {
      if (webRef.current) {
        postMessage(webRef.current, {
          type: MessageType.KEYBOARD_HIDDEN,
          isAction: true
        })
      }
    })

    return () => {
      didShowListener.remove()
      didHideListener.remove()
    }
  }, [webRef])
}

export default useKeyboardListeners
