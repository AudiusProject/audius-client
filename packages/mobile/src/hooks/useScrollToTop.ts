import { useCallback } from 'react'

import {
  NavigationProp,
  useFocusEffect,
  useNavigation
} from '@react-navigation/native'

/**
 * A hook that listens for `scrollToTop` event on all parent navigators
 * When the nearest navigator is type `tab`, Listens to `tabPress` event
 *
 * react-navigation exports `useScrollToTop` but it doesn't support nested navigators
 * see: https://github.com/react-navigation/react-navigation/issues/8586
 */
export const useScrollToTop = (
  scrollToTop: () => void,
  disableTopTabScroll = false
) => {
  const navigation = useNavigation()

  useFocusEffect(
    useCallback(() => {
      const parents = getParentNavigators(navigation)

      const removeListeners = parents.map(p =>
        p.addListener('scrollToTop' as any, () => {
          scrollToTop()
        })
      )

      const removeTabListener =
        navigation.getState().type === 'tab' && !disableTopTabScroll
          ? navigation.addListener('tabPress' as any, () => {
              scrollToTop()
            })
          : null

      return () => {
        removeListeners.forEach(r => r())
        removeTabListener?.()
      }
    }, [navigation, scrollToTop, disableTopTabScroll])
  )
}

/**
 * Get array of all parent navigators
 */
const getParentNavigators = (
  navigation: NavigationProp<any>,
  parents: NavigationProp<any>[] = []
): NavigationProp<any>[] => {
  const parent = navigation.getParent()
  if (!parent) {
    return [navigation, ...parents]
  }
  return getParentNavigators(parent, [navigation, ...parents])
}
