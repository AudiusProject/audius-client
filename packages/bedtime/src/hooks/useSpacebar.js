import { useEffect } from 'preact/hooks'

// Calls `onSpaceBar` on spacebar press
export const useSpacebar = (onSpaceBar, enabled) => {
  useEffect(() => {
    const onKeydown = (e) => {
      if (enabled && event.keyCode === 32) {
        onSpaceBar()
      }
    }

    window.document.addEventListener('keydown', onKeydown)
    return () => {
      window.document.removeEventListener('keydown', onKeydown)
    }
  }, [onSpaceBar, enabled])
}
