import React, { useCallback } from 'react'

import { Button, ButtonType, IconTwitterBird, IconCheck } from '@audius/stems'
import cn from 'classnames'

import { useSelector } from 'common/hooks/useSelector'
import { Name } from 'common/models/Analytics'
import { getAccountUser } from 'common/store/account/selectors'
import { getSendTipData } from 'common/store/tipping/selectors'
import { formatWei, weiToAudioString } from 'common/utils/wallet'
import { useRecord, make } from 'store/analytics/actions'
import { openTwitterLink } from 'utils/tweet'

import styles from './TipAudio.module.css'
import { TipProfilePicture } from './TipProfilePicture'

const messages = {
  sending: 'SENDING',
  sentSuccessfully: 'SENT SUCCESSFULLY',
  supportOnTwitter: 'Share your support on Twitter!',
  shareToTwitter: 'Share to Twitter',
  twitterCopy: 'TBD'
}

export const TipSent = () => {
  const record = useRecord()
  const account = useSelector(getAccountUser)
  const sendTipData = useSelector(getSendTipData)
  const { user: recipient, amount: sendAmount } = sendTipData

  const handleShareClick = useCallback(() => {
    // todo: update url and copy
    openTwitterLink(null, messages.twitterCopy)
    if (account && recipient) {
      record(
        make(Name.TIP_AUDIO_TWITTER_SHARE, {
          senderWallet: account.spl_wallet,
          recipientWallet: recipient.spl_wallet,
          senderHandle: account.handle,
          recipientHandle: recipient.handle,
          amount: weiToAudioString(sendAmount)
        })
      )
    }
  }, [account, recipient, record, sendAmount])

  const renderSentAudio = () => (
    <>
      <div className={cn(styles.flexCenter, styles.sentSuccessfullyContainer)}>
        <span className={styles.sentSuccessfullyIcon}>
          <IconCheck />
        </span>
        {messages.sentSuccessfully}
      </div>
      <div className={cn(styles.flexCenter, styles.sentAudio)}>
        <span className={styles.sendAmount}>{formatWei(sendAmount, true)}</span>
        $AUDIO
      </div>
    </>
  )

  return recipient ? (
    <div className={styles.container}>
      {renderSentAudio()}
      <TipProfilePicture
        user={recipient}
        className={styles.confirmProfileUser}
        imgClassName={styles.smallDynamicPhoto}
      />
      <div className={cn(styles.flexCenter, styles.support)}>
        {messages.supportOnTwitter}
      </div>
      <div className={styles.flexCenter}>
        <Button
          className={styles.shareButton}
          type={ButtonType.PRIMARY}
          text={messages.shareToTwitter}
          onClick={handleShareClick}
          leftIcon={<IconTwitterBird width={24} height={24} />}
        />
      </div>
    </div>
  ) : null
}
