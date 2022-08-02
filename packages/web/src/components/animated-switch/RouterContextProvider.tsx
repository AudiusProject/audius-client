import { createContext, memo, useState } from 'react'

import { useIsMobile } from 'utils/clientUtil'

export enum SlideDirection {
  FROM_LEFT = 'left',
  FROM_RIGHT = 'right'
}

type RouterContextProps = {
  stackReset: boolean
  setStackReset: (updated: boolean) => void
  slideDirection: SlideDirection
  setSlideDirection: (updated: SlideDirection) => void
}

export const RouterContext = createContext<RouterContextProps>({
  stackReset: false,
  setStackReset: () => {},
  slideDirection: SlideDirection.FROM_LEFT,
  setSlideDirection: () => {}
})

/**
 * `RouterContextProvider` maintains navigational stack properties that tie into
 * page change animations.
 * When the stack is "reset," the next page animation should be immediate rather than
 * animated
 */
export const RouterContextProvider = memo(
  (props: { children: JSX.Element }) => {
    const [stackReset, setStackReset] = useState(false)
    const [slideDirection, setSlideDirection] = useState(
      SlideDirection.FROM_LEFT
    )

    if (useIsMobile()) {
      return (
        <RouterContext.Provider
          value={{
            stackReset,
            setStackReset,
            slideDirection,
            setSlideDirection
          }}
        >
          {props.children}
        </RouterContext.Provider>
      )
    }

    return props.children
  }
)
