import { useCallback, useState } from 'react'

import { push as pushRoute } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import { CHATS_PAGE } from 'utils/route'

import { CallToActionBanner } from './CallToActionBanner'

const messages = {
  text: 'Direct Messaging Out Now! Message Other Artists And Fans Today',
  pill: 'New'
}

const DIRECT_MESSAGES_BANNER_LOCAL_STORAGE_KEY = 'dismissDirectMessagesBanner'

export const DirectMessagesBanner = () => {
  const dispatch = useDispatch()
  const [isVisible, setIsVisible] = useState(
    !window.localStorage.getItem(DIRECT_MESSAGES_BANNER_LOCAL_STORAGE_KEY)
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
