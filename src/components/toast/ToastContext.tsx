import React, { createContext, memo, useState, useCallback } from 'react'
import Toast from './mobile/Toast'

import styles from './ToastContext.module.css'
import { useTransition, animated } from 'react-spring'
import { getSafeArea, SafeAreaDirection } from 'utils/safeArea'
import { uuid } from 'utils/uid'

const DEFAULT_TIMEOUT = 3000

const animationConfig = {
  tension: 125,
  friction: 20,
  precision: 0.1
}

type ToastContextProps = {
  toast: (text: string, timeout?: number) => void
}

type Toast = {
  text: string
  key: string
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

export const ToastContext = createContext<ToastContextProps>({
  toast: () => {}
})

export const ToastContextProvider = memo((props: { children: JSX.Element }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(
    (text: string, timeout: number = DEFAULT_TIMEOUT) => {
      const key = uuid()
      setToasts(toasts => [...toasts, { text, key }])
      setTimeout(() => {
        setToasts(toasts => toasts.slice(1))
      }, timeout)
    },
    [setToasts]
  )

  const transitions = useTransition(toasts, toast => toast.key, {
    from: (toast: Toast) => ({ y: FROM_POSITION, opacity: 0 }),
    enter: (toast: Toast) => ({
      y: ENTER_POSITION + getSafeArea(SafeAreaDirection.TOP),
      opacity: 1
    }),
    leave: (toast: Toast) => ({ y: FROM_POSITION, opacity: 0 }),
    unique: true,
    config: animationConfig
  })

  return (
    <ToastContext.Provider
      value={{
        toast
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
          <Toast text={item.text} isControlled isOpen />
        </animated.div>
      ))}
      {props.children}
    </ToastContext.Provider>
  )
})
