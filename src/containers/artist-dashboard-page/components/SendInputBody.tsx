import {
  Button,
  TokenValueSlider,
  TokenValueInput,
  Format
} from '@audius/stems'
import BN from 'bn.js'
import React, { useCallback, useState } from 'react'
import { WalletAddress } from 'store/wallet/slice'
import { Nullable } from 'utils/typeUtils'
import { ModalBodyWrapper } from '../WalletModal'
import styles from './SendInputBody.module.css'
import { checkWeiNumber, parseWeiNumber } from 'utils/formatUtil'
// @ts-ignore
window.bn = BN
const messages = {
  warningTitle: 'PROCEED WITH CAUTION',
  warningSubtitle: 'If you send $AUDIO to the wrong address it will be lost.',
  addressPlaceholder: '0xC7EF9651259197aA26544Af724441a46e491c12c',
  sendAudio: 'SEND $AUDIO',
  insufficientBalance: 'Account does not have enough $AUDIO',
  amountRequired: 'Amount is a required field',
  amountMalformed: 'Amount must be a valid number',
  addressMalformed: 'Please enter a valid address',
  addressRequired: 'Address is required',
  sendAmountLabel: 'Amount to SEND',
  destination: 'Destination Address'
}

type BalanceError = 'INSUFFICIENT_BALANCE' | 'EMPTY' | 'MALFORMED'
type AddressError = 'MALFORMED' | 'EMPTY'

const balanceErrorMap: { [B in BalanceError]: string } = {
  INSUFFICIENT_BALANCE: messages.insufficientBalance,
  EMPTY: messages.amountRequired,
  MALFORMED: messages.amountMalformed
}

const addressErrorMap: { [A in AddressError]: string } = {
  MALFORMED: messages.addressMalformed,
  EMPTY: messages.addressRequired
}

type SendInputBodyProps = {
  currentBalance: BN
  onSend: (balance: BN, destinationAddress: WalletAddress) => void
}

// TODO: replace the inputs with fancy comma adding inputs :o

// TODO: REGEX for validating destination
const isValidDestination = (wallet: WalletAddress) => true

const validateWallet = (wallet: Nullable<string>): Nullable<AddressError> => {
  if (!wallet) return 'EMPTY'
  if (!isValidDestination(wallet)) return 'MALFORMED'
  return null
}

const validateSendAmount = (
  stringAmount: string,
  balance: BN
): Nullable<BalanceError> => {
  if (!stringAmount.length) return 'EMPTY'
  try {
    const amount = new BN(stringAmount)
    if (amount.gte(balance)) return 'INSUFFICIENT_BALANCE'
  } catch (e) {
    return 'MALFORMED'
  }

  return null
}

const SendInputBody = ({ currentBalance, onSend }: SendInputBodyProps) => {
  const [amountToSend, setAmountToSend] = useState('')
  const [amountToSendBN, setAmountToSendBN] = useState(new BN('0'))
  const [destinationAddress, setDestinationAddress] = useState('')

  const setTextAmount = useCallback(
    (newVal: string) => {
      console.log(`Settings: ${newVal}`)
      setAmountToSend(newVal)
      if (checkWeiNumber(newVal)) {
        setAmountToSendBN(parseWeiNumber(newVal)!)
      }
    },
    [setAmountToSend, setAmountToSendBN]
  )

  const min = new BN('')
  const max = new BN('100000000000000000000000000')

  const [balanceError, setBalanceError] = useState<Nullable<BalanceError>>(null)
  const [addressError, setAddressError] = useState<Nullable<AddressError>>(null)

  const onClickSend = () => {
    const balanceError = validateSendAmount(amountToSend, currentBalance)
    const walletError = validateWallet(destinationAddress)
    setBalanceError(balanceError)
    setAddressError(walletError)
    if (balanceError || walletError) return
    onSend(new BN(amountToSend), destinationAddress)
  }

  const renderBalanceError = () => {
    if (!balanceError) return null
    return balanceErrorMap[balanceError]
  }

  const renderAddressError = () => {
    if (!addressError) return null
    return addressErrorMap[addressError]
  }

  return (
    <ModalBodyWrapper>
      <div className={styles.titleContainer}>
        <div className={styles.title}>{messages.warningTitle}</div>
        <div className={styles.subtitle}>{messages.warningSubtitle}</div>
      </div>
      <TokenValueSlider
        className={styles.sliderContainer} // ?: string
        sliderClassName={styles.slider} // ?: string
        min={min} // ?: BN
        max={max} // ?: BN
        value={amountToSendBN} // : BN
        minSliderWidth={4} // ?: number
        isIncrease={true} // ?: boolean
        // minWrapper={undefined} // ?: React.ComponentType<{ value: BN }>
        // maxWrapper={undefined} // ?: React.ComponentType<{ value: BN }>
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
        onChange={setTextAmount}
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
        rightLabel={'$AUDIO'}
        value={destinationAddress}
        isNumeric={false}
        onChange={setDestinationAddress}
      />
      {renderAddressError()}
      <Button
        className={styles.sendBtn}
        text={messages.sendAudio}
        onClick={onClickSend}
      />
    </ModalBodyWrapper>
  )
}

export default SendInputBody
