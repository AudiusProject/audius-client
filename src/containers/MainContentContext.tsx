import React, { createContext, memo, useRef, MutableRefObject } from 'react'

export const MainContentContext = createContext({
  mainContentRef: { current: null } as MutableRefObject<HTMLDivElement | null>
})

export const MainContentContextProvider = memo(
  (props: { children: JSX.Element }) => {
    const mainContentRef = useRef<HTMLDivElement>(null)
    return (
      <MainContentContext.Provider
        value={{
          mainContentRef
        }}
      >
        {props.children}
      </MainContentContext.Provider>
    )
  }
)
