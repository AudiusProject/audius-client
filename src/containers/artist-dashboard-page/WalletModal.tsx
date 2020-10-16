import React, { useCallback } from 'react'
import AudiusModal from 'components/general/AudiusModal'
import { ReactComponent as IconReceive } from 'assets/img/iconReceive.svg'
import { ReactComponent as IconSend } from 'assets/img/iconSend.svg'
import { useDispatch } from 'react-redux'
import cn from 'classnames'
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
  audioToWei,
  BNWei,
  getAccountBalance,
  getClaimableBalance,
  StringAudio,
  StringWei,
  stringWeiToBN,
  WalletAddress,
  weiToString
} from 'store/wallet/slice'
import { useSelector } from 'utils/reducer'
import { Nullable } from 'utils/typeUtils'
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

const TitleWrapper = ({
  children,
  label
}: {
  children: React.ReactNode
  label: string
}) => {
  return (
    <div className={styles.titleWrapper}>
      {children}
      {label}
    </div>
  )
}

const titlesMap = {
  CLAIM: {
    CLAIMING: messages.claimingTitle,
    SUCCESS: messages.claimSuccess,
    ERROR: messages.claimError
  },
  RECEIVE: {
    KEY_DISPLAY: (
      <TitleWrapper label={messages.receive}>
        <IconReceive className={styles.receiveWrapper} />
      </TitleWrapper>
    )
  },
  SEND: {
    INPUT: (
      <TitleWrapper label={messages.send}>
        <IconSend className={styles.sendIconWrapper} />
      </TitleWrapper>
    ),
    AWAITING_CONFIRMATION: (
      <TitleWrapper label={messages.confirmSend}>
        <IconSend className={styles.sendIconWrapper} />
      </TitleWrapper>
    ),
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

/**
 * Common title across modals
 */
export const ModalBodyTitle = ({ text }: { text: string }) => {
  return <div className={styles.title}>{text}</div>
}

export const ModalBodyWrapper = ({
  children,
  className
}: {
  className?: string
  children: React.ReactNode
}) => {
  return (
    <div className={cn(styles.modalContainer, { [className!]: !!className })}>
      {children}
    </div>
  )
}

type ModalContentProps = {
  modalState: ModalState
  onInputSendData: (amount: StringAudio, wallet: WalletAddress) => void
  onConfirmSend: () => void
}

const ModalContent = ({
  modalState,
  onInputSendData,
  onConfirmSend
}: ModalContentProps) => {
  const balance: BNWei =
    useSelector(getAccountBalance) ?? stringWeiToBN('0' as StringWei)
  const account = useSelector(getAccountUser)
  const claimableBalance: BNWei =
    useSelector(getClaimableBalance) ?? stringWeiToBN('0' as StringWei)
  const amountPendingTransfer = useSelector(getSendData)

  if (!modalState || !account) return null

  // This silly `ret` dance is to satisfy
  // TS's no-fallthrough rule...
  let ret: Nullable<JSX.Element> = null

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
              amountToTransfer={amountPendingTransfer.amount}
              recipientAddress={amountPendingTransfer.recipientWallet}
              onSend={onConfirmSend}
              balance={balance}
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

const shouldAllowDismiss = (modalState: Nullable<ModalState>) => {
  // Allow dismiss on every stage except claiming
  if (!modalState) return true
  return !(
    modalState.stage === 'CLAIM' && modalState.flowState.stage === 'CLAIMING'
  )
}

const WalletModal = () => {
  const modalVisible = useSelector(getModalVisible)
  const modalState = useSelector(getModalState)

  const dispatch = useDispatch()
  const onClose = useCallback(() => {
    dispatch(setModalVisibility({ isVisible: false }))
  }, [dispatch])

  const onInputSendData = (amount: StringAudio, wallet: WalletAddress) => {
    const wei = audioToWei(amount)
    const stringWei = weiToString(wei)
    dispatch(inputSendData({ amount: stringWei, wallet }))
  }

  const onConfirmSend = () => {
    dispatch(confirmSend())
  }
  const allowDismiss = shouldAllowDismiss(modalState)

  return (
    <AudiusModal
      isOpen={modalVisible}
      onClose={onClose}
      bodyClassName={styles.modalBody}
      showTitleHeader
      title={getTitle(modalState)}
      showDismissButton={allowDismiss}
      dismissOnClickOutside={allowDismiss}
      contentHorizontalPadding={24}
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
