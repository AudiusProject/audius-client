import { useCallback, useState } from 'react'

import { useDispatch } from 'react-redux'

import { setVisibility as setAppModalCTAVisibility } from 'store/application/ui/app-cta-modal/slice'

import { CallToActionBanner } from './CallToActionBanner'

const MOBILE_BANNER_LOCAL_STORAGE_KEY = 'dismissMobileAppBanner'

const messages = {
  text: 'Download the Audius App',
  pill: 'New'
}
export const DownloadAppBanner = () => {
  const dispatch = useDispatch()
  const [isVisible, setIsVisible] = useState(
    !window.localStorage.getItem(MOBILE_BANNER_LOCAL_STORAGE_KEY)
  )

  const handleAccept = useCallback(() => {
    dispatch(setAppModalCTAVisibility({ isOpen: true }))
  }, [dispatch])

  const handleClose = useCallback(() => {
    setIsVisible(false)
    window.localStorage.setItem(MOBILE_BANNER_LOCAL_STORAGE_KEY, 'true')
  }, [])

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
