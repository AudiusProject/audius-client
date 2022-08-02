import { useState, useEffect, useCallback } from 'react'

import type { AppStateStatus } from 'react-native'
import { AppState } from 'react-native'

/**
 * `active` - The app is running in the foreground
 * `background` - The app is running in the background. The user is either:
 *   - in another app
 *   - on the home screen
 *   - [Android] on another Activity (even if it was launched by your app)
 * [iOS] `inactive` - This is a state that occurs when transitioning between foreground & background,
 * and during periods of inactivity such as entering the Multitasking view or in the event of an incoming call
 */

type OnEnterForeground = () => void | null
type OnEnterBackground = () => void | null

const NotActive = /inactive|background/g

export const useAppState = (
  onEnterForeground: OnEnterForeground,
  onEnterBackground: OnEnterBackground
) => {
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  )
  const handleAppStateChange = useCallback(
    (nextAppState) => {
      if (
        appState.match(NotActive) &&
        nextAppState === 'active' &&
        onEnterForeground
      ) {
        console.info('Enter foreground')
        onEnterForeground()
      }
      if (
        appState === 'active' &&
        nextAppState.match(NotActive) &&
        onEnterBackground
      ) {
        console.info('Enter background')
        onEnterBackground()
      }
      setAppState(nextAppState)
    },
    [appState, onEnterForeground, onEnterBackground]
  )

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    )
    return () => subscription.remove()
  }, [handleAppStateChange])

  return appState
}

export default useAppState
