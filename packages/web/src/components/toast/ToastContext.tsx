import { createContext, useCallback } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useTransition, animated } from 'react-spring'

import { CommonState } from 'common/store'
import { clearToasts, toast } from 'common/store/ui/toast/slice'
import { getSafeArea, SafeAreaDirection } from 'utils/safeArea'

import styles from './ToastContext.module.css'
import Toast from './mobile/Toast'

const DEFAULT_TIMEOUT = 3000

const animationConfig = {
  tension: 125,
  friction: 20,
  precision: 0.1
}

const FROM_POSITION = -20
const ENTER_POSITION = 20
const TOAST_SPACING = 40

// Interpolates the index of a toast in the list of visible
// toasts to a valid Y index into [FROM_POSITION, index * toast spacing + ENTER_POSITION]
const interp = (i: number) => (y: number) =>
  y === FROM_POSITION
    ? `translate3d(0,${y}px,0)`
    : `translate3d(0, ${y + i * TOAST_SPACING}px, 0)`

type ToastContextProps = {
  toast: (content: string | JSX.Element, timeout?: number) => void
  clear: () => void
}

type ToastType = {
  content: string | JSX.Element
  key: string
}

export const ToastContext = createContext<ToastContextProps>({
  clear: () => {},
  toast: () => {}
})

export const ToastContextProvider = (props: { children: JSX.Element }) => {
  const toasts = useSelector((state: CommonState) => state.ui.toast.toasts)
  const dispatch = useDispatch()

  const handleToast = useCallback(
    (content: string | JSX.Element, timeout: number = DEFAULT_TIMEOUT) => {
      dispatch(toast({ content, timeout }))
    },
    [dispatch]
  )

  const clear = useCallback(() => {
    dispatch(clearToasts())
  }, [dispatch])

  const transitions = useTransition(toasts, (toast) => toast.key, {
    from: (toast: ToastType) => ({ y: FROM_POSITION, opacity: 0 }),
    enter: (toast: ToastType) => ({
      y: ENTER_POSITION + getSafeArea(SafeAreaDirection.TOP),
      opacity: 1
    }),
    leave: (toast: ToastType) => ({ y: FROM_POSITION, opacity: 0 }),
    unique: true,
    config: animationConfig
  })

  return (
    <ToastContext.Provider
      value={{
        clear,
        toast: handleToast
      }}
    >
      {transitions.map(({ item, props, key }, i) => (
        <animated.div
          key={key}
          className={styles.container}
          style={{
            // @ts-ignore
            transform: props.y.interpolate(interp(i)),
            opacity: props.opacity
          }}
        >
          <Toast content={item.content} isControlled isOpen />
        </animated.div>
      ))}
      {props.children}
    </ToastContext.Provider>
  )
}
