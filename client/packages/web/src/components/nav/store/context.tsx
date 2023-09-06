import {
  ReactNode,
  createContext,
  useState,
  memo,
  useRef,
  useContext,
  useEffect,
  useCallback
} from 'react'

import { useIsMobile } from 'utils/clientUtil'

type NavContextProps = {
  setLeft: (el: LeftElement) => void
  setCenter: (el: CenterElement) => void
  setRight: (el: RightElement) => void
  leftElement: LeftElement
  centerElement: CenterElement
  rightElement: RightElement
}

export enum LeftPreset {
  BACK = 'BACK',
  CLOSE = 'CLOSE',
  CLOSE_NO_ANIMATION = 'CLOSE_NO_ANIMATION',
  NOTIFICATION = 'NOTIFICATION',
  SETTINGS = 'SETTINGS'
}

export enum CenterPreset {
  LOGO = 'LOGO'
}

export enum RightPreset {
  SEARCH = 'SEARCH'
}

type LeftElement = LeftPreset | ReactNode | null
type CenterElement = CenterPreset | string | null
type RightElement = RightPreset | ReactNode | null

export const NavContext = createContext<NavContextProps>({
  setLeft: () => {},
  setCenter: () => {},
  setRight: () => {},
  leftElement: LeftPreset.NOTIFICATION,
  centerElement: CenterPreset.LOGO,
  rightElement: RightPreset.SEARCH
})

export const useNavContext = () => {
  const [leftElement, setLeft] = useState<LeftElement>(LeftPreset.NOTIFICATION)
  const [centerElement, setCenter] = useState<CenterElement>(CenterPreset.LOGO)
  const [rightElement, setRight] = useState<RightElement>(RightPreset.SEARCH)
  return {
    leftElement,
    setLeft,
    centerElement,
    setCenter,
    rightElement,
    setRight
  }
}

export const NavProvider = memo((props: { children: JSX.Element }) => {
  const contextValue = useNavContext()
  if (useIsMobile()) {
    return (
      <NavContext.Provider value={contextValue}>
        {props.children}
      </NavContext.Provider>
    )
  }
  return props.children
})

/**
 * Sets the nav for a "main" or "root" level page.
 * Notifications on the left, logo in the middle, search on the right.
 */
export const useMainPageHeader = () => {
  const { setLeft, setCenter, setRight } = useContext(NavContext)!
  useEffect(() => {
    setLeft(LeftPreset.NOTIFICATION)
    setCenter(CenterPreset.LOGO)
    setRight(RightPreset.SEARCH)
  }, [setLeft, setCenter, setRight])
}

/**
 * Sets the nav for a generic sub-page.
 * Back button on the left, logo in the middle, search on the right.
 */
export const useSubPageHeader = () => {
  const { setLeft, setCenter, setRight } = useContext(NavContext)!
  useEffect(() => {
    setLeft(LeftPreset.BACK)
    setCenter(CenterPreset.LOGO)
    setRight(RightPreset.SEARCH)
  }, [setLeft, setCenter, setRight])
}

/**
 * Rather than setting the context directly, electing to `useTemproraryNavContext`
 * will allow a component to (on mount) set the NavContext in such a way that when
 * that component unmounts, the nav context is reset to whatever it was set to last.
 *
 * This is useful in cases like Playlist-Creation, which can be done from many
 * contexts and when the page is closed, the previous context should be displayed.
 *
 * The hook returns a callback that can be called to manually reset the nav state.
 */
export const useTemporaryNavContext = (
  setters: () => {
    left: LeftElement
    center: CenterElement
    right: RightElement
  }
): (() => void) => {
  const initialContext = useRef<any>(null)
  const {
    setLeft,
    setCenter,
    setRight,
    leftElement,
    centerElement,
    rightElement
  } = useContext(NavContext)!
  useEffect(() => {
    if (!initialContext.current) {
      initialContext.current = {
        leftElement,
        centerElement,
        rightElement
      }
    }
  }, [leftElement, centerElement, rightElement, initialContext])

  useEffect(() => {
    const { left, center, right } = setters()

    setLeft(left)
    setCenter(center)
    setRight(right)

    return () => {
      setLeft(initialContext.current.leftElement)
      setCenter(initialContext.current.centerElement)
      setRight(initialContext.current.rightElement)
    }
  }, [setLeft, setRight, setCenter, setters])

  return useCallback(() => {
    setLeft(initialContext.current.leftElement)
    setCenter(initialContext.current.centerElement)
    setRight(initialContext.current.rightElement)
  }, [setLeft, setRight, setCenter, initialContext])
}

export default NavContext
