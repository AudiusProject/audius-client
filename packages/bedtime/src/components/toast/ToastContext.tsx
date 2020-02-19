import { createContext } from 'preact'
import { useCallback, useState } from 'preact/hooks'
import Toast from './Toast'

import styles from './ToastContext.module.css'

const DEFAULT_TIMEOUT = 3000

interface ToastContextProps {
  toast: (text: string, timeout?: number) => void
}

interface Toast {
  text: string,
}

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

  return (
    <ToastContext.Provider value={{
      toast
    }}>
        <Toast
          text={toastState?.text}
          isControlled={true}
          isOpen={true}
        />
      { props.children }
    </ToastContext.Provider>
  )
}
