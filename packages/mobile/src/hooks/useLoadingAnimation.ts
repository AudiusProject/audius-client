import { useRef, useLayoutEffect } from 'react'

import { LayoutAnimation, Platform, UIManager } from 'react-native'

const useLoadingAnimation = (isDepLoaded: () => boolean, dependency: any) => {
  // Prevents multiple re-renders if the dependency changes.
  const isLoaded = useRef(false)

  if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
  }

  useLayoutEffect(() => {
    if (isDepLoaded() && !isLoaded.current) {
      isLoaded.current = true
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    }
  }, [dependency, isDepLoaded])
}

export default useLoadingAnimation
