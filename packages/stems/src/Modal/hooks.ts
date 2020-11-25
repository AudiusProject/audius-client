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
  }, [getCount, isOverflowHidden])

  const incrementScrollCount = useCallback(() => setCount(count => count + 1), [
    setCount
  ])
  const decrementScrollCount = useCallback(() => setCount(count => count - 1), [
    setCount
  ])

  return {
    incrementScrollCount,
    decrementScrollCount
  }
}
