import { createContext } from 'preact'
import { useState } from 'preact/hooks'

export const PauseContext = createContext({
  pause: () => {},
  unpause: () => {},
  isPaused: false
})

export const PauseContextProvider = (props) => {
  const [isPaused, setIsPaused] = useState(false)
  const pause = () => setIsPaused(true)
  const unpause = () => setIsPaused(false)

  return (
    <PauseContext.Provider
      value={{
        pause, 
        unpause,
        isPaused
      }}
    >
      { props.children }
    </PauseContext.Provider>
  )
}

