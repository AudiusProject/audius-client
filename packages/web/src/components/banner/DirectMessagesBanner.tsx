import { useCallback, useState } from 'react'

import { Client, accountSelectors } from '@audius/common'
import { push as pushRoute } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import { useSelector } from 'common/hooks/useSelector'
import { getClient } from 'utils/clientUtil'
import { CHATS_PAGE } from 'utils/route'

import { CallToActionBanner } from './CallToActionBanner'

const messages = {
  text: 'Direct Messaging Now Available!',
  pill: 'New'
}

const { getHasAccount } = accountSelectors

const DIRECT_MESSAGES_BANNER_LOCAL_STORAGE_KEY = 'dismissDirectMessagesBanner'

/**
 * Displays a CTA Banner announcing the launch of Direct Messaging
 * for logged in users on desktop web and desktop app (since logged out users can't use Direct Messages)
 */
export const DirectMessagesBanner = () => {
  const dispatch = useDispatch()
  const signedIn = useSelector(getHasAccount)
  const isMobile = getClient() === Client.MOBILE
  const hasDismissed = window.localStorage.getItem(
    DIRECT_MESSAGES_BANNER_LOCAL_STORAGE_KEY
  )
  const [isVisible, setIsVisible] = useState(
    !hasDismissed && !isMobile && signedIn
  )

  const handleAccept = useCallback(() => {
    dispatch(pushRoute(CHATS_PAGE))
  }, [dispatch])

  const handleClose = useCallback(() => {
    setIsVisible(false)
    window.localStorage.setItem(
      DIRECT_MESSAGES_BANNER_LOCAL_STORAGE_KEY,
      'true'
    )
  }, [])
  return isVisible ? (
    <CallToActionBanner
      text={messages.text}
      pill={messages.pill}
      emoji={'speech-balloon'}
      onClose={handleClose}
      onAccept={handleAccept}
    />
  ) : null
}
