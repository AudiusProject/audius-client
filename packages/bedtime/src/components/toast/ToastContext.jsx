import { createContext } from 'preact'
import { useCallback, useState } from 'preact/hooks'
import Toast from './Toast'
import cn from 'classnames'

import styles from './ToastContext.module.css'

const DEFAULT_TIMEOUT = 3000

// TODO: props
// interface ToastContextProps {
//   toast: (text: string, timeout?: number) => void
// }

// interface Toast {
//   text: string,
// }

export const ToastContext = createContext({
  toast: () => {}
})

// TODO: This ToastContextProvider is copied from AudiusDapp. In the future we should
// pull it out of dapp into stems.
export const ToastContextProvider = (props) => {
  const [toastState, setToastState] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  const toast = useCallback((text, timeout = DEFAULT_TIMEOUT) => {
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
      {
         <div
           className={cn(styles.container, { [styles.down]: isVisible })}
         >
          <Toast
            text={toastState ? toastState.text : ''}
            isControlled={true}
            isOpen={true}
          />
        </div>
      }
      { props.children }
    </ToastContext.Provider>
  )
}
