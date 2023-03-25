import { Suspense, useState, useEffect, useCallback, lazy } from 'react'

import { useAsync } from 'react-use'

import { localStorage } from 'services/local-storage'
import { useIsMobile, isElectron } from 'utils/clientUtil'
import { getPathname, HOME_PAGE, publicSiteRoutes } from 'utils/route'

import Dapp from './app'

const PublicSite = lazy(() => import('./pages/PublicSite'))

const isPublicSiteRoute = (location = window.location) => {
  const pathname = getPathname(location).toLowerCase()
  return [...publicSiteRoutes, HOME_PAGE].includes(pathname)
}

const isPublicSiteSubRoute = (location = window.location) => {
  const pathname = getPathname(location).toLowerCase()
  return publicSiteRoutes.includes(pathname)
}

const clientIsElectron = isElectron()

const Root = () => {
  const [dappReady, setDappReady] = useState(false)
  const [renderPublicSite, setRenderPublicSite] = useState(isPublicSiteRoute())
  const isMobileClient = useIsMobile()

  const { value: foundUser } = useAsync(() =>
    localStorage.getCurrentUserExists()
  )

  useEffect(() => {
    // TODO: listen to history and change routes based on history...
    window.onpopstate = () => {
      setRenderPublicSite(isPublicSiteRoute())
    }
  }, [])

  const setReady = useCallback(() => setDappReady(true), [])

  const [shouldShowPopover, setShouldShowPopover] = useState(true)

  const shouldRedirectToApp = foundUser && !isPublicSiteSubRoute()
  if (renderPublicSite && !clientIsElectron && !shouldRedirectToApp) {
    return (
      <Suspense fallback={<div style={{ width: '100vw', height: '100vh' }} />}>
        <PublicSite
          isMobile={isMobileClient}
          onClickAppRedirect={() => setShouldShowPopover(false)}
          onDismissAppRedirect={() => setShouldShowPopover(false)}
          setRenderPublicSite={setRenderPublicSite}
        />
      </Suspense>
    )
  }

  return (
    <>
      <Dapp
        isReady={dappReady}
        setReady={setReady}
        shouldShowPopover={shouldShowPopover}
      />
    </>
  )
}

export default Root
