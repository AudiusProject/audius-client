import React, { cloneElement, useCallback, useEffect, useState } from 'react'

import { Format, IconTrophy, TokenValueInput } from '@audius/stems'
import BN from 'bn.js'
import cn from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as IconQuestionCircle } from 'assets/img/iconQuestionCircle.svg'
import IconNoTierBadge from 'assets/img/tokenBadgeNoTier.png'
import { BadgeTier } from 'common/models/BadgeTier'
import { SquareSizes } from 'common/models/ImageSizes'
import { Supporter, Supporting } from 'common/models/Tipping'
import { BNWei, StringAudio, StringWei } from 'common/models/Wallet'
import { getAccountUser } from 'common/store/account/selectors'
import { getProfileUser } from 'common/store/pages/profile/selectors'
import { getSupporters, getSupporting } from 'common/store/tipping/selectors'
import { sendTip } from 'common/store/tipping/slice'
import { getAccountBalance } from 'common/store/wallet/selectors'
import { getTierAndNumberForBalance } from 'common/store/wallet/utils'
import {
  formatWei,
  parseAudioInputToWei,
  stringWeiToBN,
  weiToString
} from 'common/utils/wallet'
import Tooltip from 'components/tooltip/Tooltip'
import UserBadges, { audioTierMapPng } from 'components/user-badges/UserBadges'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'
import ButtonWithArrow from 'pages/audio-rewards-page/components/ButtonWithArrow'

import styles from './TipAudio.module.css'

const messages = {
  availableToSend: 'AVAILABLE TO SEND',
  sendATip: 'Send Tip',
  enterAnAmount: 'Enter an amount',
  insufficientBalance: 'Insufficient Balance',
  tooltip: '$AUDIO held in linked wallets cannot be used for tipping',
  becomeTopSupporterPrefix: 'Tip ',
  becomeTopSupporterSuffix: ' $AUDIO To Become Their Top Supporter'
}

export const SendTip = () => {
  const dispatch = useDispatch()
  const account = useSelector(getAccountUser)
  const supportersMap = useSelector(getSupporters)
  const supportingMap = useSelector(getSupporting)
  const profile = useSelector(getProfileUser)
  const profileImage = useUserProfilePicture(
    profile?.user_id ?? null,
    profile?._profile_picture_sizes ?? null,
    SquareSizes.SIZE_150_BY_150
  )

  const accountBalance = (useSelector(getAccountBalance) ??
    new BN('0')) as BNWei

  const [tipAmount, setTipAmount] = useState<StringAudio>('' as StringAudio)
  const [tipAmountBNWei, setTipAmountBNWei] = useState<BNWei>(
    new BN('0') as BNWei
  )

  const { tier } = getTierAndNumberForBalance(weiToString(accountBalance))
  const audioBadge = audioTierMapPng[tier as BadgeTier]

  const [isDisabled, setIsDisabled] = useState(true)
  const [hasError, setHasError] = useState(false)

  const [
    amountToTipToBecomeTopSupporter,
    setAmountToTipToBecomeTopSupporter
  ] = useState<BNWei | null>(null)
  const [supporting, setSupporting] = useState<Supporting | null>(null)
  const [topSupporter, setTopSupporter] = useState<Supporter | null>(null)

  useEffect(() => {
    if (!account || !profile) return

    const newSupporting =
      supportingMap[account.user_id]?.find(
        sup => sup.supporting.user_id === profile.user_id
      ) ?? null
    if (newSupporting) {
      setSupporting(newSupporting)
    }
  }, [account, profile, supportingMap])

  useEffect(() => {
    if (!profile) return

    // todo: make sure these are already pre-sorted by highest support amount
    const newTopSupporter = supportersMap[profile.user_id]?.length
      ? supportersMap[profile.user_id][0]
      : null
    if (newTopSupporter) {
      setTopSupporter(newTopSupporter)
    }
  }, [profile, supportersMap])

  useEffect(() => {
    const zeroWei = stringWeiToBN('0' as StringWei)
    const newAmountWei = parseAudioInputToWei(tipAmount) ?? zeroWei
    setTipAmountBNWei(newAmountWei)

    const hasInsufficientBalance = newAmountWei.gt(accountBalance)
    setIsDisabled(hasInsufficientBalance || newAmountWei.lte(zeroWei))
    setHasError(hasInsufficientBalance)
  }, [tipAmount, accountBalance])

  const handleTipAmountChange = useCallback(
    (value: string) => {
      setTipAmount(value as StringAudio)
      setAmountToTipToBecomeTopSupporter(null)
    },
    [setTipAmount, setAmountToTipToBecomeTopSupporter]
  )

  const onBlur = useCallback(() => {
    if (hasError || !account || !topSupporter) return

    const isAlreadyTopSupporter =
      account.user_id === topSupporter.supporter.user_id
    if (isAlreadyTopSupporter) return

    const topSupporterAmountWei = stringWeiToBN(
      topSupporter.amount.toString() as StringWei
    )
    let newAmountToTipToBecomeTopSupporter = topSupporterAmountWei
    if (supporting) {
      const supportingAmountWei = stringWeiToBN(
        supporting.amount.toString() as StringWei
      )
      newAmountToTipToBecomeTopSupporter = topSupporterAmountWei.sub(
        supportingAmountWei
      ) as BNWei
    }
    if (accountBalance.gte(newAmountToTipToBecomeTopSupporter)) {
      setAmountToTipToBecomeTopSupporter(newAmountToTipToBecomeTopSupporter)
    }
  }, [hasError, account, topSupporter, supporting, accountBalance])

  const handleSendClick = useCallback(() => {
    dispatch(sendTip({ amount: tipAmountBNWei }))
  }, [dispatch, tipAmountBNWei])

  return profile ? (
    <div className={styles.container}>
      <div className={styles.profileUser}>
        <div className={styles.accountWrapper}>
          <img className={styles.dynamicPhoto} src={profileImage} />
          <div className={styles.userInfoWrapper}>
            <div className={styles.name}>
              {profile.name}
              <UserBadges
                userId={profile?.user_id}
                badgeSize={12}
                className={styles.badge}
              />
            </div>
            <div className={styles.handleContainer}>
              <span className={styles.handle}>{`@${profile.handle}`}</span>
            </div>
          </div>
        </div>
      </div>
      {amountToTipToBecomeTopSupporter && (
        <div className={cn(styles.flexCenter, styles.becomeTopSupporter)}>
          <IconTrophy className={styles.becomeTopSupporterTrophy} />
          <span>
            {messages.becomeTopSupporterPrefix}
            {formatWei(amountToTipToBecomeTopSupporter, true, 0)}
            {messages.becomeTopSupporterSuffix}
          </span>
        </div>
      )}
      <div className={styles.amountToSend}>
        <TokenValueInput
          className={styles.inputContainer}
          rightLabelClassName={styles.rightLabel}
          inputClassName={styles.input}
          format={Format.INPUT}
          placeholder={'Enter an amount'}
          rightLabel={'$AUDIO'}
          value={tipAmount}
          isNumeric={true}
          isWhole={true}
          onChange={handleTipAmountChange}
          onBlur={onBlur}
        />
      </div>
      <div className={styles.amountAvailableContainer}>
        <div className={styles.amountAvailableText}>
          {messages.availableToSend}
          <Tooltip text={messages.tooltip} mount='parent'>
            <span>
              <IconQuestionCircle
                className={styles.amountAvailableInfo}
                width={18}
                height={18}
              />
            </span>
          </Tooltip>
        </div>
        <div className={styles.amountContainer}>
          {audioBadge ? (
            cloneElement(audioBadge, {
              height: 16,
              width: 16
            })
          ) : (
            <img alt='no tier' src={IconNoTierBadge} width='16' height='16' />
          )}
          <span className={styles.amountAvailable}>
            {formatWei(accountBalance, true, 0)}
          </span>
        </div>
      </div>
      <div className={cn(styles.flexCenter, styles.buttonContainer)}>
        <ButtonWithArrow
          text={messages.sendATip}
          onClick={handleSendClick}
          textClassName={styles.buttonText}
          className={cn(styles.buttonText, { [styles.disabled]: isDisabled })}
          disabled={isDisabled}
        />
      </div>
      {hasError && (
        <div className={cn(styles.flexCenter, styles.error)}>
          {messages.insufficientBalance}
        </div>
      )}
    </div>
  ) : null
}
