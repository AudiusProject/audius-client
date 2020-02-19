import { createContext } from 'preact'
import { useCallback, useState } from 'preact/hooks'
import Toast from './Toast'

import { animated, useTransition } from 'react-spring'
import styles from './ToastContext.module.css'

const DEFAULT_TIMEOUT = 3000

const animationConfig = {
  tension: 125,
  friction: 20,
  precision: 0.1
}

interface ToastContextProps {
  toast: (text: string, timeout?: number) => void
}

interface Toast {
  text: string,
}

const FROM_POSITION = -20
const ENTER_POSITION = 20

const interp = (y: number) => `translate3d(0,${y}px,0)`

export const ToastContext = createContext<ToastContextProps>({
  toast: () => {}
})

// TODO: This ToastContextProvider is copied from AudiusDapp. In the future we should
// pull it out of dapp into stems.
export const ToastContextProvider = (props: { children: JSX.Element | null }) => {
  const [toastState, setToastState] = useState<Toast | null>(null)

  const toast = useCallback((text: string, timeout: number = DEFAULT_TIMEOUT) => {
    setToastState({ text })
    setTimeout(() => {
      setToastState(null)
    }, timeout)
  }, [setToastState])

  const transitions = useTransition(toastState, null, {
    from: (toast: Toast) => ({ y: FROM_POSITION, opacity: 0 }),
    enter: (toast: Toast) => ({ y: ENTER_POSITION, opacity: 1 }),
    leave: (toast: Toast) => ({ y: FROM_POSITION, opacity: 0 }),
    unique: true,
    config: animationConfig
  })

  return (
    <ToastContext.Provider value={{
      toast
    }}>
      { transitions.map(({ item, props, key }, i) => (
        item && <animated.div
          key={key}
          className={styles.container}
          style={{
            // @ts-ignore
            transform: props.y.interpolate(interp),
            opacity: props.opacity
          }}
        >
          <Toast
            text={item.text}
            isControlled={true}
            isOpen={true}
          />
        </animated.div>
      ))}
      { props.children }
    </ToastContext.Provider>
  )
}
