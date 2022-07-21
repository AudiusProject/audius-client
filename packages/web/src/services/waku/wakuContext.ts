import { createContext, useContext } from 'react'

import { Waku } from 'js-waku'

export type WakuContextType = {
  waku?: Waku
  activeHandle?: string
  setActiveHandle?: (handle?: string) => void
}

export const WakuContext = createContext<WakuContextType>({
  waku: undefined,
  activeHandle: undefined,
  setActiveHandle: undefined
})
export const useWaku = () => useContext(WakuContext)
