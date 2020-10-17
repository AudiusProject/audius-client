import {
  Button,
  TokenValueInput,
  Format,
  IconValidationX,
  ButtonType
} from '@audius/stems'
import React, { useMemo, useState } from 'react'
import {
  audioToWei,
  BNAudio,
  BNWei,
  StringAudio,
  stringAudioToBN,
  StringWei,
  stringWeiToBN,
  WalletAddress,
  weiToAudio
} from 'store/wallet/slice'
import { Nullable } from 'utils/typeUtils'
import { ModalBodyTitle, ModalBodyWrapper } from '../WalletModal'
import styles from './SendInputBody.module.css'
import DashboardTokenValueSlider from './DashboardTokenValueSlider'
import { convertFloatToWei } from 'utils/formatUtil'
import { MIN_TRANSFERRABLE_WEI } from 'services/wallet-client/WalletClient'

const messages = {
  warningTitle: 'PROCEED WITH CAUTION',
  warningSubtitle: 'If you send $AUDIO to the wrong address it will be lost.',
  addressPlaceholder: '0xC7EF9651259197aA26544Af724441a46e491c12c',
  sendAudio: 'SEND $AUDIO',
  insufficientBalance: 'Account does not have enough $AUDIO',
  amountRequired: 'Amount is a required field',
  amountInsufficient: 'This amount of $AUDIO is too low to send.',
  amountMalformed: 'Amount must be a valid number',
  addressMalformed: 'Please enter a valid address',
  addressRequired: 'Address is required',
  sendAmountLabel: 'Amount to SEND',
  destination: 'Destination Address'
}

type BalanceError =
  | 'INSUFFICIENT_BALANCE'
  | 'INSUFFICIENT_TRANSFER_AMOUNT'
  | 'EMPTY'
  | 'MALFORMED'
type AddressError = 'MALFORMED' | 'EMPTY'

const balanceErrorMap: { [B in BalanceError]: string } = {
  INSUFFICIENT_BALANCE: messages.insufficientBalance,
  EMPTY: messages.amountRequired,
  MALFORMED: messages.amountMalformed,
  INSUFFICIENT_TRANSFER_AMOUNT: messages.amountInsufficient
}

const addressErrorMap: { [A in AddressError]: string } = {
  MALFORMED: messages.addressMalformed,
  EMPTY: messages.addressRequired
}

type SendInputBodyProps = {
  currentBalance: BNWei
  onSend: (balance: BNWei, destinationAddress: WalletAddress) => void
}

const isValidDestination = (wallet: WalletAddress) => {
  const libs = window.audiusLibs
  return libs.web3Manager.web3.utils.isAddress(wallet)
}

const validateWallet = (wallet: Nullable<string>): Nullable<AddressError> => {
  if (!wallet) return 'EMPTY'
  if (!isValidDestination(wallet)) return 'MALFORMED'
  return null
}

const validateSendAmount = (
  stringAudioAmount: StringAudio,
  balanceWei: BNWei
): Nullable<BalanceError> => {
  if (!stringAudioAmount.length) return 'EMPTY'
  const sendWeiBN = parseAudioInputToWei(stringAudioAmount)
  if (!sendWeiBN) return 'MALFORMED'
  if (sendWeiBN.gt(balanceWei)) return 'INSUFFICIENT_BALANCE'
  if (sendWeiBN.lt(MIN_TRANSFERRABLE_WEI)) return 'INSUFFICIENT_TRANSFER_AMOUNT'

  return null
}

const ErrorLabel = ({ text }: { text: string }) => {
  return (
    <div className={styles.errorLabel}>
      <IconValidationX /> {text}
    </div>
  )
}

const parseAudioInputToWei = (audio: StringAudio): Nullable<BNWei> => {
  if (!audio.length) return null
  // First try converting from float, in case audio has decimal value
  const floatWei = convertFloatToWei(audio) as Nullable<BNWei>
  if (floatWei) return floatWei
  // Safe to assume no decimals
  try {
    return audioToWei(audio)
  } catch {
    return null
  }
}

const SendInputBody = ({ currentBalance, onSend }: SendInputBodyProps) => {
  const [amountToSend, setAmountToSend] = useState<StringAudio>(
    '' as StringAudio
  )
  const amountToSendBNWei: BNWei = useMemo(() => {
    const zeroWei = stringWeiToBN('0' as StringWei)
    return parseAudioInputToWei(amountToSend) ?? zeroWei
  }, [amountToSend])
  const [destinationAddress, setDestinationAddress] = useState('')

  const [min, max]: [BNAudio, BNAudio] = useMemo(() => {
    const min = stringAudioToBN('0' as StringAudio)
    const max = weiToAudio(currentBalance)
    return [min, max]
  }, [currentBalance])

  const [balanceError, setBalanceError] = useState<Nullable<BalanceError>>(null)
  const [addressError, setAddressError] = useState<Nullable<AddressError>>(null)

  const onClickSend = () => {
    const balanceError = validateSendAmount(amountToSend, currentBalance)
    const walletError = validateWallet(destinationAddress)
    setBalanceError(balanceError)
    setAddressError(walletError)
    if (balanceError || walletError) return
    onSend(amountToSendBNWei, destinationAddress)
  }

  const renderBalanceError = () => {
    if (!balanceError) return null
    return <ErrorLabel text={balanceErrorMap[balanceError]} />
  }

  const renderAddressError = () => {
    if (!addressError) return null
    return <ErrorLabel text={addressErrorMap[addressError]} />
  }

  return (
    <ModalBodyWrapper>
      <div className={styles.titleContainer}>
        <ModalBodyTitle text={messages.warningTitle} />
        <div className={styles.subtitle}>{messages.warningSubtitle}</div>
      </div>
      <DashboardTokenValueSlider
        min={min}
        max={max}
        value={weiToAudio(amountToSendBNWei)}
      />
      <TokenValueInput
        className={styles.inputContainer}
        labelClassName={styles.label}
        rightLabelClassName={styles.label}
        inputClassName={styles.input}
        label={messages.sendAmountLabel}
        format={Format.INPUT}
        placeholder={'0'}
        rightLabel={'$AUDIO'}
        value={amountToSend}
        isNumeric={true}
        onChange={v => setAmountToSend(v as StringAudio)}
      />
      {renderBalanceError()}
      <TokenValueInput
        className={styles.inputContainer}
        labelClassName={styles.label}
        rightLabelClassName={styles.label}
        inputClassName={styles.input}
        label={messages.destination}
        format={Format.INPUT}
        placeholder={messages.addressPlaceholder}
        value={destinationAddress}
        isNumeric={false}
        onChange={setDestinationAddress}
      />
      {renderAddressError()}
      <Button
        className={styles.sendBtn}
        text={messages.sendAudio}
        onClick={onClickSend}
        type={ButtonType.PRIMARY_ALT}
      />
    </ModalBodyWrapper>
  )
}

export default SendInputBody
