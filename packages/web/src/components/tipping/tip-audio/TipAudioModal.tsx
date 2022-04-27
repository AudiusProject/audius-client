import React, { useCallback } from 'react'

import { useDispatch } from 'react-redux'

import { ReactComponent as IconGoldBadge } from 'assets/img/IconGoldBadge.svg'
import { ReactComponent as IconVerifiedGreen } from 'assets/img/iconVerifiedGreen.svg'
import { useSelector } from 'common/hooks/useSelector'
import { getSendStatus } from 'common/store/tipping/selectors'
import { resetSend } from 'common/store/tipping/slice'
import { TippingSendStatus } from 'common/store/tipping/types'
import ModalDrawer from 'pages/audio-rewards-page/components/modals/ModalDrawer'

import { ConfirmSendTip } from './ConfirmSendTip'
import { SendTip } from './SendTip'
import styles from './TipAudio.module.css'
import { TipSent } from './TipSent'

const messages = {
  sendATip: 'Send Tip',
  confirm: 'Confirm',
  tipSent: 'Tip Sent'
}

const titlesMap: { [key in TippingSendStatus]?: JSX.Element | string } = {
  SEND: (
    <div className={styles.tipIconTextContainer}>
      <IconGoldBadge width={24} height={24} />
      <span className={styles.tipText}>{messages.sendATip}</span>
    </div>
  ),
  CONFIRM: (
    <div className={styles.tipIconTextContainer}>
      <IconGoldBadge width={24} height={24} />
      <span className={styles.tipText}>{messages.confirm}</span>
    </div>
  ),
  SENDING: (
    <div className={styles.tipIconTextContainer}>
      <IconGoldBadge width={24} height={24} />
      <span className={styles.tipText}>{messages.confirm}</span>
    </div>
  ),
  SUCCESS: (
    <div className={styles.tipIconTextContainer}>
      <IconVerifiedGreen width={24} height={24} />
      <span className={styles.tipText}>{messages.tipSent}</span>
    </div>
  )
}

const ModalContent = () => {
  const sendStatus = useSelector(getSendStatus)
  switch (sendStatus) {
    case 'SEND':
      return <SendTip />
    case 'CONFIRM':
    case 'SENDING':
    case 'ERROR':
      return <ConfirmSendTip />
    case 'SUCCESS':
      return <TipSent />
    default:
      return null
  }
}

export const TipAudioModal = () => {
  const dispatch = useDispatch()
  const sendStatus = useSelector(getSendStatus)

  const onClose = useCallback(() => {
    dispatch(resetSend())
  }, [dispatch])

  return (
    <ModalDrawer
      isOpen={sendStatus !== null}
      onClose={onClose}
      bodyClassName={styles.modalBody}
      showTitleHeader
      title={sendStatus ? titlesMap[sendStatus] : ''}
      showDismissButton={sendStatus !== 'SENDING'}
      dismissOnClickOutside={sendStatus !== 'SENDING'}
      contentHorizontalPadding={24}
      useGradientTitle={false}
    >
      <div className={styles.modalContentContainer}>
        <ModalContent />
      </div>
    </ModalDrawer>
  )
}
