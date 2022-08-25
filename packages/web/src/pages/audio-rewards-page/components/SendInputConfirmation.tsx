import {
  BNWei,
  StringAudio,
  WalletAddress,
  stringAudioToBN,
  weiToAudio,
  tokenDashboardPageSelectors
} from '@audius/common'
import { Button, ButtonType, IconArrow } from '@audius/stems'

import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { useSelector } from 'utils/reducer'

import { ModalBodyTitle, ModalBodyWrapper } from '../WalletModal'

import DashboardTokenValueSlider from './DashboardTokenValueSlider'
import DisplayAudio from './DisplayAudio'
import styles from './SendInputConfirmation.module.css'
const { getCanRecipientReceiveWAudio, getAwaitingConfirmationIsLoading } =
  tokenDashboardPageSelectors

const messages = {
  title: "YOU'RE ABOUT TO SEND",
  sendButton: 'SEND $AUDIO',
  errorMessage:
    'This account does not contain enough SOL to create an $AUDIO wallet.'
}

type SendInputConfirmationProps = {
  balance: BNWei
  amountToTransfer: BNWei
  recipientAddress: WalletAddress
  onSend: () => void
}

export const AddressWithArrow = ({ address }: { address: WalletAddress }) => {
  return (
    <div className={styles.addressWrapper}>
      <IconArrow className={styles.arrow} />
      {address}
    </div>
  )
}

const SendInputConfirmation = ({
  amountToTransfer,
  balance,
  recipientAddress,
  onSend
}: SendInputConfirmationProps) => {
  const canRecipientReceiveWAudio = useSelector(getCanRecipientReceiveWAudio)
  const isLoading = useSelector(getAwaitingConfirmationIsLoading)
  return (
    <ModalBodyWrapper>
      <div className={styles.titleWrapper}>
        <ModalBodyTitle text={messages.title} />
      </div>
      <DashboardTokenValueSlider
        min={stringAudioToBN('0' as StringAudio)}
        max={weiToAudio(balance)}
        value={weiToAudio(amountToTransfer)}
      />
      <DisplayAudio amount={amountToTransfer} />
      <AddressWithArrow address={recipientAddress} />
      <div className={styles.buttonWrapper}>
        <Button
          text={messages.sendButton}
          onClick={onSend}
          type={ButtonType.PRIMARY_ALT}
          disabled={!canRecipientReceiveWAudio || isLoading}
          rightIcon={
            isLoading ? (
              <LoadingSpinner className={styles.loadingSpinner} />
            ) : null
          }
        />
      </div>
      {canRecipientReceiveWAudio || isLoading ? null : (
        <div className={styles.errorMessage}>{messages.errorMessage}</div>
      )}
    </ModalBodyWrapper>
  )
}

export default SendInputConfirmation
