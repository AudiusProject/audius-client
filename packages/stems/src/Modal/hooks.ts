import useGlobal from 'hooks/useGlobal'
import { useCallback, useEffect, useState } from 'react'

export const setOverflowHidden = () => {
  document.body.setAttribute('style', 'overflow:hidden;')
}

export const removeOverflowHidden = () => {
  document.body.setAttribute('style', '')
}

export const setModalRootTop = () => {
  const root = document.getElementById('modalRootContainer')
  if (root) {
    root.setAttribute('style', `top: ${window.scrollY}px`)
  }
}

export const useModalScrollCount = () => {
  const [getCount, setCount] = useGlobal('modal-scroll-count', 0)
  // Keep a state toggle to trigger recomputations of the effect
  const [toggle, setToggle] = useState(false)
  const [isOverflowHidden, setIsOverflowHidden] = useState(false)

  useEffect(() => {
    if (!isOverflowHidden && getCount() > 0) {
      setIsOverflowHidden(true)
      setOverflowHidden()
      setModalRootTop()
    } else if (isOverflowHidden && getCount() === 0) {
      setIsOverflowHidden(false)
      removeOverflowHidden()
    }
  }, [getCount, isOverflowHidden, toggle])

  const incrementScrollCount = useCallback(() => {
    setCount(count => count + 1)
    setToggle(toggle => !toggle)
  }, [setCount, setToggle])
  const decrementScrollCount = useCallback(() => {
    // Though we should in theory never be decrementing past zero, getting into
    // that state would be bad for us, so guard against it defensively
    setCount(count => Math.max(0, count - 1))
    setToggle(toggle => !toggle)
  }, [setCount, setToggle])

  return {
    incrementScrollCount,
    decrementScrollCount
  }
}
