import React, { useCallback } from 'react'

import { useDispatch } from 'react-redux'
import { usePrevious } from 'react-use'

import { ReactComponent as IconGoldBadge } from 'assets/img/IconGoldBadge.svg'
import { ReactComponent as IconVerifiedGreen } from 'assets/img/iconVerifiedGreen.svg'
import { useSelector } from 'common/hooks/useSelector'
import { getSendStatus } from 'common/store/tipping/selectors'
import { resetSend } from 'common/store/tipping/slice'
import { TippingSendStatus } from 'common/store/tipping/types'
import { ModalTransitionContainer } from 'components/modal-transition-container/ModalTransitionContainer'
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

const statusOrder = {
  SEND: 0,
  CONFIRM: 1,
  SENDING: 1,
  ERROR: 1,
  SUCCESS: 2
}

export const TipAudioModal = () => {
  const dispatch = useDispatch()
  const sendStatus = useSelector(getSendStatus)
  const previousSendStatus = usePrevious(sendStatus)

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
        {sendStatus && (
          <ModalTransitionContainer
            item={sendStatus}
            fromStyles={{
              opacity: 1,
              transform:
                !previousSendStatus ||
                statusOrder[previousSendStatus] <= statusOrder[sendStatus]
                  ? sendStatus === 'SEND'
                    ? 'translate3d(0%,0,0)'
                    : 'translate3d(488px,0,0)'
                  : sendStatus === 'SEND'
                  ? 'translate3d(-488px,0,0)'
                  : 'translate3d(0%,0,0)'
            }}
            enterStyles={{
              opacity: 1,
              transform: 'translate3d(0%,0,0)'
            }}
            leaveStyles={{
              opacity: 0,
              transform:
                !previousSendStatus ||
                statusOrder[previousSendStatus] <= statusOrder[sendStatus]
                  ? 'translate3d(-488px,0,0)'
                  : 'translate3d(488px,0,0)'
            }}
            config={
              !previousSendStatus || sendStatus === 'SEND'
                ? { duration: 75 }
                : { duration: 220 }
            }
            additionalStyles={{ width: '100%' }}
          >
            <ModalContent />
          </ModalTransitionContainer>
        )}
      </div>
    </ModalDrawer>
  )
}
