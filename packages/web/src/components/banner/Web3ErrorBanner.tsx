import { useCallback, useState } from 'react'

import { getWeb3Error } from 'common/store/backend/selectors'
import { isMobile } from 'utils/clientUtil'
import { useSelector } from 'utils/reducer'

import { CallToActionBanner } from './CallToActionBanner'
import styles from './Web3ErrorBanner.module.css'

const messages = {
  text: 'Read The Configuration Guide',
  pill: 'Metamask Configured Incorrectly'
}

const META_MASK_SETUP_URL =
  'https://medium.com/@audius/configuring-metamask-for-use-with-audius-91e24bf6840'

export const Web3ErrorBanner = () => {
  const web3Error = useSelector(getWeb3Error)
  const [isVisible, setIsVisible] = useState(web3Error && !isMobile())

  const handleAccept = useCallback(() => {
    const win = window.open(META_MASK_SETUP_URL, '_blank')
    win?.focus()
  }, [])

  const handleClose = useCallback(() => {
    setIsVisible(false)
  }, [setIsVisible])

  return isVisible ? (
    <CallToActionBanner
      className={styles.root}
      text={messages.text}
      pill={messages.pill}
      onAccept={handleAccept}
      onClose={handleClose}
    />
  ) : null
}
