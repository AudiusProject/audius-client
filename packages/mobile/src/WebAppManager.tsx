import type { ReactNode } from 'react'

import { useSelector } from 'react-redux'

import { SplashScreen, useSplashScreenKey } from 'app/screens/splash-screen'

import { getCommonStoreLoaded } from './store/lifecycle/selectors'

type WebAppManagerProps = {
  children: ReactNode
}

export const WebAppManager = ({ children }: WebAppManagerProps) => {
  const isCommonStoreLoaded = useSelector(getCommonStoreLoaded)

  // Rekey the splash animation if the dapp loading
  // state changes

  return <>{children}</>
}
