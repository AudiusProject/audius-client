import { useCallback, useState } from 'react'

import { Client, accountSelectors } from '@audius/common'
import { useDispatch } from 'react-redux'

import { useSelector } from 'common/hooks/useSelector'
import { setVisibility as setAppModalCTAVisibility } from 'store/application/ui/app-cta-modal/slice'
import { getClient } from 'utils/clientUtil'

import { CallToActionBanner } from './CallToActionBanner'

const MOBILE_BANNER_LOCAL_STORAGE_KEY = 'dismissMobileAppBanner'

const { getHasAccount } = accountSelectors

const messages = {
  text: 'Download the Audius App',
  pill: 'New'
}

/**
 * Displays a CTA Banner encouraging the user to downlaod web and mobile apps
 * if the user is not logged in on desktop web (as logged in users see the Direct Messaging banner)
 */
export const DownloadAppBanner = () => {
  const dispatch = useDispatch()
  const signedIn = useSelector(getHasAccount)
  const hasDismissed = window.localStorage.getItem(
    MOBILE_BANNER_LOCAL_STORAGE_KEY
  )
  const isDesktopWeb = getClient() === Client.DESKTOP
  const [isVisible, setIsVisible] = useState(
    !hasDismissed && isDesktopWeb && !signedIn
  )

  const handleClose = useCallback(() => {
    setIsVisible(false)
    window.localStorage.setItem(MOBILE_BANNER_LOCAL_STORAGE_KEY, 'true')
  }, [])

  const handleAccept = useCallback(() => {
    dispatch(setAppModalCTAVisibility({ isOpen: true }))
    handleClose()
  }, [dispatch, handleClose])

  return isVisible ? (
    <CallToActionBanner
      text={messages.text}
      pill={messages.pill}
      emoji={'face-with-party-horn-and-party-hat'}
      onAccept={handleAccept}
      onClose={handleClose}
    />
  ) : null
}
