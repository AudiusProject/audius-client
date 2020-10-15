import BN from 'bn.js'
import AudiusModal from 'components/general/AudiusModal'
import React, { ReactNode, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { getAccountUser } from 'store/account/selectors'
import {
  confirmSend,
  getModalState,
  getModalVisible,
  getSendData,
  inputSendData,
  ModalState,
  setModalVisibility
} from 'store/token-dashboard/slice'
import {
  getAccountBalance,
  getClaimableBalance,
  WalletAddress
} from 'store/wallet/slice'
import { useSelector } from 'utils/reducer'
import ClaimingModalBody from './components/ClaimingModalBody'
import ClaimSuccessBody from './components/ClaimSuccessBody'
import ReceiveBody from './components/ReceiveBody'
import SendInputBody from './components/SendInputBody'
import SendInputConfirmation from './components/SendInputConfirmation'
import SendInputSuccess from './components/SendInputSuccess'
import styles from './WalletModal.module.css'

const messages = {
  claimingTitle: "Hold Tight, We're Claiming Your $AUDIO!",
  claimSuccess: 'Your $AUDIO Is Claimed!',
  claimError: 'Uh oh! Something went wrong with your claim.',
  receive: 'Receive $AUDIO',
  send: 'Send $AUDIO',
  confirmSend: 'Send $AUDIO',
  sent: 'Your $AUDIO Has Been Sent',
  sendError: 'Uh oh! Something went wrong sending your $AUDIO.'
}

const titlesMap = {
  CLAIM: {
    CLAIMING: messages.claimingTitle,
    SUCCESS: messages.claimSuccess,
    ERROR: messages.claimError
  },
  RECEIVE: {
    KEY_DISPLAY: messages.receive
  },
  SEND: {
    INPUT: messages.send,
    AWAITING_CONFIRMATION: messages.confirmSend,
    CONFIRMED_SEND: messages.sent,
    ERROR: messages.sendError
  }
}

const getTitle = (state: ModalState) => {
  if (!state?.stage) return ''
  switch (state.stage) {
    case 'CLAIM':
      return titlesMap.CLAIM[state.flowState.stage]
    case 'RECEIVE':
      return titlesMap.RECEIVE[state.flowState.stage]
    case 'SEND':
      return titlesMap.SEND[state.flowState.stage]
  }
}

const ClaimErrorBody = () => null
const SentErrorBody = () => null

export const ModalBodyWrapper = ({
  children
}: {
  children: React.ReactNode
}) => {
  return <div className={styles.modalContainer}>{children}</div>
}

type ModalContentProps = {
  modalState: ModalState
  onInputSendData: (amount: BN, wallet: WalletAddress) => void
  onConfirmSend: () => void
}

const ModalContent = ({
  modalState,
  onInputSendData,
  onConfirmSend
}: ModalContentProps) => {
  const balance = useSelector(getAccountBalance) ?? new BN('0')
  const account = useSelector(getAccountUser)
  const claimableBalance = useSelector(getClaimableBalance) ?? new BN('0')
  const amountPendingTransfer = useSelector(getSendData)

  if (!modalState || !account) return null

  let ret: JSX.Element | null = null

  switch (modalState.stage) {
    case 'CLAIM': {
      const claimStage = modalState.flowState.stage
      switch (claimStage) {
        case 'CLAIMING':
          ret = <ClaimingModalBody balance={claimableBalance} />
          break
        case 'SUCCESS':
          ret = <ClaimSuccessBody balance={balance} />
          break
        case 'ERROR':
          ret = <ClaimErrorBody />
          break
      }
      break
    }
    case 'RECEIVE': {
      // @ts-ignore
      // TODO: users need to have wallets...
      const wallet = account.wallet
      ret = <ReceiveBody wallet={wallet} />
      break
    }
    case 'SEND': {
      const sendStage = modalState.flowState.stage
      switch (sendStage) {
        case 'INPUT':
          ret = (
            <SendInputBody currentBalance={balance} onSend={onInputSendData} />
          )
          break
        case 'AWAITING_CONFIRMATION':
          if (!amountPendingTransfer) return null
          ret = (
            <SendInputConfirmation
              balance={balance}
              amountToTransfer={amountPendingTransfer.amount}
              recipientAddress={amountPendingTransfer.recipientWallet}
              onSend={onConfirmSend}
            />
          )
          break
        case 'CONFIRMED_SEND':
          if (!amountPendingTransfer) return null
          ret = (
            <SendInputSuccess
              sentAmount={amountPendingTransfer.amount}
              recipientAddress={amountPendingTransfer.recipientWallet}
              balance={balance}
            />
          )

          break

        case 'ERROR':
          ret = <SentErrorBody />
          break
      }
    }
  }
  return ret
}

const WalletModal = () => {
  const modalVisible = useSelector(getModalVisible)
  const modalState = useSelector(getModalState)

  const dispatch = useDispatch()
  const onClose = useCallback(() => {
    dispatch(setModalVisibility({ isVisible: false }))
  }, [dispatch])

  const onInputSendData = (amount: BN, wallet: WalletAddress) => {
    dispatch(inputSendData({ amount: amount.toString(), wallet }))
  }

  const onConfirmSend = () => {
    dispatch(confirmSend())
  }

  return (
    <AudiusModal
      isOpen={modalVisible}
      onClose={onClose}
      bodyClassName={styles.modalBody}
      showTitleHeader
      title={getTitle(modalState)}
    >
      <div className={styles.modalContainer}>
        <ModalContent
          modalState={modalState}
          onInputSendData={onInputSendData}
          onConfirmSend={onConfirmSend}
        />
      </div>
    </AudiusModal>
  )
}

export default WalletModal
