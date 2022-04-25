import React, { cloneElement, useCallback, useEffect, useState } from 'react'

import { Format, TokenValueInput } from '@audius/stems'
import BN from 'bn.js'
import cn from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as IconQuestionCircle } from 'assets/img/iconQuestionCircle.svg'
import IconNoTierBadge from 'assets/img/tokenBadgeNoTier.png'
import { BadgeTier } from 'common/models/BadgeTier'
import { SquareSizes } from 'common/models/ImageSizes'
import { BNWei, StringAudio, StringWei } from 'common/models/Wallet'
import { getProfileUser } from 'common/store/pages/profile/selectors'
import { sendTip } from 'common/store/tipping/slice'
import { getAccountBalance } from 'common/store/wallet/selectors'
import { getTierAndNumberForBalance } from 'common/store/wallet/utils'
import { convertFloatToWei } from 'common/utils/formatUtil'
import { Nullable } from 'common/utils/typeUtils'
import {
  audioToWei,
  formatWei,
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
  tooltip: '$AUDIO held in linked wallets cannot be used for tipping'
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

export const SendTip = () => {
  const dispatch = useDispatch()
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

  useEffect(() => {
    const zeroWei = stringWeiToBN('0' as StringWei)
    const newAmountWei = parseAudioInputToWei(tipAmount) ?? zeroWei
    setTipAmountBNWei(newAmountWei)

    const insufficientBalance = newAmountWei.gt(accountBalance)
    setIsDisabled(insufficientBalance || newAmountWei.lte(zeroWei))
    setHasError(insufficientBalance)
  }, [tipAmount, accountBalance])

  const handleTipAmountChange = useCallback(
    (value: string) => {
      setTipAmount(value as StringAudio)
    },
    [setTipAmount]
  )

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
      <div className={styles.amountToSend}>
        {/* <Input
          placeholder={messages.enterAnAmount}
          // variant={isMobile ? 'normal' : 'elevatedPlaceholder'}
          // size='medium'
          value={tipAmount}
          onChange={handleAmountChange}
          // onKeyDown={onKeyDown}
          // className={cn(styles.signInInput, {
          //   [styles.placeholder]: email.value === '',
          //   [styles.inputError]: showError,
          //   [styles.validInput]: validInput
          // })}
          // error={showError}
          // onBlur={onBlur}
          // disabled={shouldDisableInputs}
        /> */}
        <TokenValueInput
          className={styles.inputContainer}
          // labelClassName={styles.label}
          rightLabelClassName={styles.rightLabel}
          inputClassName={styles.input}
          // label={messages.enterAnAmount}
          format={Format.INPUT}
          placeholder={'Enter an amount'}
          rightLabel={'$AUDIO'}
          value={tipAmount}
          isNumeric={true}
          onChange={handleTipAmountChange}
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
