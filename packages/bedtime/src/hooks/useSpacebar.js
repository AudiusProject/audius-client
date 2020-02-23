import { useEffect } from 'preact/hooks'

export const useSpacebar = (onSpaceBar) => {
  useEffect(() => {
    const onKeydown = (e) => {
      if (event.keyCode === 32) {
        onSpaceBar()
      }
    }

    window.document.addEventListener('keydown', onKeydown)
    return () => {
      window.document.removeEventListener('keydown', onKeydown)
    }
  }, [onSpaceBar])
}
