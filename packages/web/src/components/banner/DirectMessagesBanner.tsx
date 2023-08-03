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

export const DirectMessagesBanner = () => {
  const dispatch = useDispatch()
  const hasAccount = useSelector(getHasAccount)
  const [isVisible, setIsVisible] = useState(
    !window.localStorage.getItem(DIRECT_MESSAGES_BANNER_LOCAL_STORAGE_KEY) &&
      ((getClient() === Client.DESKTOP && hasAccount) ||
        getClient() === Client.ELECTRON)
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
