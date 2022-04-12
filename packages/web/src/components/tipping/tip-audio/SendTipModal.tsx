import React, { cloneElement, useCallback, useState } from 'react'

import BN from 'bn.js'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as IconQuestionMark } from 'assets/img/iconQuestionMark.svg'
import IconNoTierBadge from 'assets/img/tokenBadgeNoTier.png'
import { useSelectTierInfo } from 'common/hooks/wallet'
import { BadgeTier } from 'common/models/BadgeTier'
import { SquareSizes } from 'common/models/ImageSizes'
import { BNWei } from 'common/models/Wallet'
import { getAccountUser } from 'common/store/account/selectors'
import { getProfileUser } from 'common/store/pages/profile/selectors'
import UserBadges, { audioTierMapPng } from 'components/user-badges/UserBadges'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'
import ButtonWithArrow from 'pages/audio-rewards-page/components/ButtonWithArrow'

import styles from './TipAudio.module.css'

import { getAccountTotalBalance } from 'common/store/wallet/selectors'
import { formatWei } from 'common/utils/wallet'
import Input from 'components/data-entry/Input'
import { setSendStatus, setSendAmount } from 'common/store/tipping/slice'
import cn from 'classnames'

const messages = {
  availableToSend: 'AVAILABLE TO SEND',
  sendATip: 'Send a Tip',
  enterAnAmount: 'Enter an amount'
}
export const SendTipModal = () => {
  const dispatch = useDispatch()
  const profile = useSelector(getProfileUser)
  const profileImage = useUserProfilePicture(
    profile?.user_id ?? null,
    profile?._profile_picture_sizes ?? null,
    SquareSizes.SIZE_150_BY_150
  )
  const account = useSelector(getAccountUser)
  // todo: should we only care about sol total balance?
  // or will we automatically swap eth audio to sol audio
  // if eth amount not enough for the tip transfer?
  let totalBalance = useSelector(getAccountTotalBalance)
  if (totalBalance === null && account?.total_balance) {
    totalBalance = new BN(account?.total_balance) as BNWei
  }
  // const nonNullTotalBalance = totalBalance !== null
  // const positiveTotalBalance =
  //   nonNullTotalBalance && totalBalance!.gt(new BN(0))
  const { tier } = useSelectTierInfo(account?.user_id ?? 0)
  const audioBadge = audioTierMapPng[tier as BadgeTier]
  const [tipAmount, setTipAmount] = useState(0)

  const handleAmountChange = useCallback((e: string) => {
    // const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log({ e })
    const newAmount = parseInt(e)
    // const newAmount = parseInt(e.target.value)
    console.log({ newAmount })
    setTipAmount(newAmount || 0)
  }, [])

  const handleSendClick = useCallback(() => {
    dispatch(setSendAmount({ amount: tipAmount }))
    dispatch(setSendStatus({ status: 'CONFIRM' }))
  }, [])

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
        <Input
          placeholder={messages.enterAnAmount}
          // type='number'
          // name='amount'
          // id='email-input'
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
        />
      </div>
      <div className={styles.amountAvailableContainer}>
        <div className={styles.amountAvailable}>
          {messages.availableToSend}
          <IconQuestionMark
            className={styles.amountAvailableInfo}
            width={18}
            height={18}
          />
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
          <span className={styles.audioAmount}>
            {formatWei(totalBalance!, true, 0)}
          </span>
        </div>
      </div>
      <div className={cn(styles.rowCenter, styles.buttonContainer)}>
        <ButtonWithArrow
          text={messages.sendATip}
          onClick={handleSendClick}
          textClassName={styles.buttonText}
          className={styles.buttonText}
        />
      </div>
    </div>
  ) : null
}
