import { useCallback, useEffect, useState } from 'react'

import { ID } from 'audius-client/src/common/models/Identifiers'
import { Supporter } from 'audius-client/src/common/models/Tipping'
import {
  BNWei,
  StringAudio,
  StringWei
} from 'audius-client/src/common/models/Wallet'
import { getAccountUser } from 'audius-client/src/common/store/account/selectors'
import {
  getOptimisticSupporters,
  getOptimisticSupporting,
  getSendUser
} from 'audius-client/src/common/store/tipping/selectors'
import {
  sendTip,
  fetchUserSupporter
} from 'audius-client/src/common/store/tipping/slice'
import { getAccountBalance } from 'audius-client/src/common/store/wallet/selectors'
import { parseWeiNumber } from 'audius-client/src/common/utils/formatUtil'
import { Nullable } from 'audius-client/src/common/utils/typeUtils'
import {
  parseAudioInputToWei,
  stringWeiToBN
} from 'audius-client/src/common/utils/wallet'
import BN from 'bn.js'

import IconArrow from 'app/assets/images/iconArrow.svg'
import IconRemove from 'app/assets/images/iconRemove.svg'
import { Button } from 'app/components/core'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useNavigation } from 'app/hooks/useNavigation'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { makeStyles } from 'app/styles'

import { TopBarIconButton } from '../app-screen'

import { AvailableAudio } from './AvailableAudio'
import { BecomeFirstSupporter } from './BecomeFirstSupporter'
import { BecomeTopSupporter } from './BecomeTopSupporter'
import { ErrorText } from './ErrorText'
import { ReceiverDetails } from './ReceiverDetails'
import { TipInput } from './TipInput'
import { TipScreen } from './TipScreen'
import { TipArtistNavigationParamList } from './navigation'

const messages = {
  sendTip: 'Send Tip',
  insufficientBalance: 'Insufficient Balance'
}

const useStyles = makeStyles(({ spacing }) => ({
  sendButton: {
    marginBottom: spacing(6)
  }
}))

const zeroWei = stringWeiToBN('0' as StringWei)

const parseToBNWei = (tipAmount: StringAudio) => {
  if (!tipAmount) return zeroWei
  return parseAudioInputToWei(tipAmount) as BNWei
}

export const SendTipScreen = () => {
  const styles = useStyles()
  const [tipAmount, setTipAmount] = useState('')
  const accountBalance = (useSelectorWeb(getAccountBalance) ??
    new BN('0')) as BNWei
  const navigation = useNavigation<TipArtistNavigationParamList>()
  const dispatchWeb = useDispatchWeb()

  const account = useSelectorWeb(getAccountUser)
  const supportersMap = useSelectorWeb(getOptimisticSupporters)
  const supportingMap = useSelectorWeb(getOptimisticSupporting)
  const receiver = useSelectorWeb(getSendUser)
  const [
    amountToTipToBecomeTopSupporter,
    setAmountToTipToBecomeTopSupporter
  ] = useState<Nullable<BNWei>>(null)
  const [supportingAmount, setSupportingAmount] = useState<Nullable<StringWei>>(
    null
  )
  const [topSupporter, setTopSupporter] = useState<Nullable<Supporter>>(null)
  const [isFirstSupporter, setIsFirstSupporter] = useState(false)

  const tipAmountWei = parseToBNWei(tipAmount)
  const hasInsufficientBalance = tipAmountWei.gt(accountBalance)

  /**
   * Get supporting info if current user is already supporting receiver
   * so that the already supported amount can be used to determine
   * how much is left to tip to become top supporter
   */
  useEffect(() => {
    if (!account || !receiver) return
    if (supportingAmount) return

    const supportingForAccount = supportingMap[account.user_id] ?? null
    const accountSupportingReceiver =
      supportingForAccount?.[receiver.user_id] ?? null
    if (accountSupportingReceiver) {
      setSupportingAmount(accountSupportingReceiver.amount)
    } else {
      dispatchWeb(
        fetchUserSupporter({
          currentUserId: account.user_id,
          userId: receiver.user_id,
          supporterUserId: account.user_id
        })
      )
    }
  }, [account, receiver, supportingAmount, supportingMap, dispatchWeb])

  /**
   * Get user who is top supporter to later check whether it is
   * not the same as the current user
   */
  useEffect(() => {
    if (!receiver) return

    const supportersForReceiver = supportersMap[receiver.user_id] ?? {}
    const rankedSupportersList = ((Object.keys(
      supportersForReceiver
    ) as unknown) as ID[])
      .sort(
        (k1, k2) =>
          supportersForReceiver[k1].rank - supportersForReceiver[k2].rank
      )
      .map(k => supportersForReceiver[k])
    const theTopSupporter =
      rankedSupportersList.length > 0 ? rankedSupportersList[0] : null

    if (theTopSupporter) {
      setIsFirstSupporter(false)
      setTopSupporter(theTopSupporter)
    } else {
      setIsFirstSupporter(true)
    }
  }, [receiver, supportersMap])

  /**
   * Check whether or not to display prompt to become top or first supporter
   */
  useEffect(() => {
    if (hasInsufficientBalance || !account || !topSupporter) return

    const isAlreadyTopSupporter = account.user_id === topSupporter.sender_id
    if (isAlreadyTopSupporter) return

    const topSupporterAmountWei = stringWeiToBN(topSupporter.amount)
    const oneAudioToWeiBN = parseWeiNumber('1') as BNWei
    let newAmountToTipToBecomeTopSupporter = topSupporterAmountWei.add(
      oneAudioToWeiBN
    ) as BNWei
    if (supportingAmount) {
      const supportingAmountWei = stringWeiToBN(supportingAmount)
      newAmountToTipToBecomeTopSupporter = newAmountToTipToBecomeTopSupporter.sub(
        supportingAmountWei
      ) as BNWei
    }
    if (
      accountBalance.gte(newAmountToTipToBecomeTopSupporter) &&
      newAmountToTipToBecomeTopSupporter.gte(oneAudioToWeiBN)
    ) {
      setAmountToTipToBecomeTopSupporter(newAmountToTipToBecomeTopSupporter)
    }
  }, [
    hasInsufficientBalance,
    account,
    topSupporter,
    supportingAmount,
    accountBalance
  ])

  const handleBack = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const handleSendTip = useCallback(() => {
    dispatchWeb(sendTip({ amount: tipAmount }))
    navigation.navigate({ native: { screen: 'ConfirmTip' } })
  }, [dispatchWeb, tipAmount, navigation])

  return (
    <TipScreen
      title={messages.sendTip}
      topbarLeft={<TopBarIconButton icon={IconRemove} onPress={handleBack} />}
    >
      <ReceiverDetails />
      {!hasInsufficientBalance && isFirstSupporter ? (
        <BecomeFirstSupporter />
      ) : null}
      {!hasInsufficientBalance && amountToTipToBecomeTopSupporter ? (
        <BecomeTopSupporter
          amountToTipToBecomeTopSupporter={amountToTipToBecomeTopSupporter}
        />
      ) : null}
      <TipInput value={tipAmount} onChangeText={setTipAmount} />
      <AvailableAudio />
      <Button
        variant='primary'
        size='large'
        title={messages.sendTip}
        onPress={handleSendTip}
        icon={IconArrow}
        iconPosition='right'
        fullWidth
        disabled={
          !tipAmount || tipAmountWei.lte(zeroWei) || hasInsufficientBalance
        }
        style={styles.sendButton}
      />
      {hasInsufficientBalance ? (
        <ErrorText>{messages.insufficientBalance}</ErrorText>
      ) : null}
    </TipScreen>
  )
}
