import { createContext } from 'preact'
import { useCallback, useState } from 'preact/hooks'
import Toast from './Toast'
import cn from 'classnames'

import transitions from './ToastTransitions.module.css'
import styles from './ToastContext.module.css'
import { CSSTransition } from 'react-transition-group'

const DEFAULT_TIMEOUT = 3000

export const ToastContext = createContext({
  toast: () => {}
})

export const ToastContextProvider = (props) => {
  const [toastState, setToastState] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  const toast = useCallback((text, timeout = DEFAULT_TIMEOUT) => {
    if (isVisible) return
    setToastState({ text })
    setIsVisible(true)
    setTimeout(() => {
      setIsVisible(false)
    }, timeout)
  }, [setToastState, setIsVisible])

  return (
    <ToastContext.Provider value={{
      toast
    }}>
      <div className={styles.container}>
        <CSSTransition
          classNames={transitions}
          mountOnEnter
          unmountOnExit
          in={isVisible}
          timeout={1000}
        >
          <Toast
            text={toastState ? toastState.text : ''}
            isControlled={true}
            isOpen={true}
          />
        </CSSTransition>
      </div>
      { props.children }
    </ToastContext.Provider>
  )
}
