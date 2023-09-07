import {
  ChangeEventHandler,
  FocusEventHandler,
  useCallback,
  useState
} from 'react'

import {
  useUSDCBalance,
  formatUSDCWeiToNumber,
  formatCurrencyBalance,
  BNUSDC,
  useWithdrawUSDCModal,
  WithdrawUSDCModalPages
} from '@audius/common'
import {
  HarmonyButton,
  HarmonyButtonSize,
  HarmonyButtonType,
  IconQuestionCircle
} from '@audius/stems'
import BN from 'bn.js'
import { useField } from 'formik'

import { Divider } from 'components/divider'
import { TextField } from 'components/form-fields'
import { Text } from 'components/typography'
import {
  ADDRESS,
  AMOUNT
} from 'components/withdraw-usdc-modal/WithdrawUSDCModal'
import {
  PRECISION,
  onTokenInputBlur,
  onTokenInputChange
} from 'utils/tokenInput'

import styles from './EnterTransferDetails.module.css'
import { Hint } from './Hint'
import { TextRow } from './TextRow'

const messages = {
  currentBalance: 'Current Balance',
  amountToWithdraw: 'Amount to Withdraw',
  destinationAddress: 'Destination Address',
  specify: `Specify how much USDC you’d like to withdraw from your Audius Account.`,
  destinationDetails: 'Provide a Solana Wallet address to transfer funds to.',
  solanaWallet: 'USDC Wallet (Solana)',
  amountInputLabel: 'Amount of USDC to withdraw',
  continue: 'Continue',
  notSure: `Not sure what you’re doing? Visit the help center for guides & more info.`,
  guide: 'Guide to USDC Transfers on Audius',
  dollars: '$',
  usdc: '(USDC)'
}

export const EnterTransferDetails = () => {
  const { data: balance } = useUSDCBalance()
  const { setData } = useWithdrawUSDCModal()

  const balanceNumber = formatUSDCWeiToNumber((balance ?? new BN(0)) as BNUSDC)
  const balanceFormatted = formatCurrencyBalance(balanceNumber)

  const [
    { value },
    { error: amountError },
    { setValue: setAmount, setTouched: setAmountTouched }
  ] = useField(AMOUNT)
  const [humanizedValue, setHumanizedValue] = useState(
    ((value || balanceNumber) / 100).toFixed(PRECISION)
  )
  const handleAmountChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const { human, value } = onTokenInputChange(e)
      setHumanizedValue(human)
      setAmount(value)
    },
    [setAmount, setHumanizedValue]
  )
  const handleAmountBlur: FocusEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setHumanizedValue(onTokenInputBlur(e))
      setAmountTouched(true)
    },
    [setHumanizedValue, setAmountTouched]
  )

  const [, { error: addressError }] = useField(ADDRESS)

  const handleContinue = useCallback(() => {
    setData({ page: WithdrawUSDCModalPages.CONFIRM_TRANSFER_DETAILS })
  }, [setData])

  return (
    <div className={styles.root}>
      <TextRow left={messages.currentBalance} right={`$${balanceFormatted}`} />
      <Divider style={{ margin: 0 }} />
      <div className={styles.amount}>
        <div className={styles.amountText}>
          <TextRow left={messages.amountToWithdraw} />
          <Text variant='body' size='medium' strength='default'>
            {messages.specify}
          </Text>
        </div>
        <TextField
          title={messages.amountToWithdraw}
          label={messages.amountToWithdraw}
          aria-label={messages.amountToWithdraw}
          name={AMOUNT}
          value={humanizedValue}
          onChange={handleAmountChange}
          onBlur={handleAmountBlur}
          startAdornment={messages.dollars}
          endAdornment={messages.usdc}
        />
      </div>
      <Divider style={{ margin: 0 }} />
      <div className={styles.destination}>
        <div className={styles.destinationText}>
          <TextRow left={messages.destinationAddress} />
          <Text variant='body' size='medium' strength='default'>
            {messages.destinationDetails}
          </Text>
        </div>
        <TextField
          title={messages.destinationAddress}
          label={messages.solanaWallet}
          aria-label={messages.destinationAddress}
          name={ADDRESS}
          placeholder=''
        />
      </div>
      <HarmonyButton
        variant={HarmonyButtonType.SECONDARY}
        size={HarmonyButtonSize.DEFAULT}
        fullWidth
        text={messages.continue}
        disabled={amountError || addressError}
        onClick={handleContinue}
      />
      <Hint
        text={messages.notSure}
        link={''} // TODO(USDC): Link
        icon={IconQuestionCircle}
        linkText={messages.guide}
      />
    </div>
  )
}
