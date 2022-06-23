import { ComponentType, useCallback, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { useUIAudio } from 'common/hooks/useUIAudio'
import { Name } from 'common/models/Analytics'
import { TipReceive } from 'common/store/notifications/types'
import {
  makeGetReactionForSignature,
  reactionOrder,
  ReactionTypes,
  writeReactionValue
} from 'common/store/ui/reactions/slice'
import { Nullable } from 'common/utils/typeUtils'
import { make } from 'store/analytics/actions'

import styles from './TipReceivedNotification.module.css'
import { AudioText } from './components/AudioText'
import { NotificationBody } from './components/NotificationBody'
import { NotificationFooter } from './components/NotificationFooter'
import { NotificationHeader } from './components/NotificationHeader'
import { NotificationTile } from './components/NotificationTile'
import { NotificationTitle } from './components/NotificationTitle'
import { ProfilePicture } from './components/ProfilePicture'
import { ReactionProps, reactionMap } from './components/Reaction'
import { TwitterShareButton } from './components/TwitterShareButton'
import { UserNameLink } from './components/UserNameLink'
import { IconTip } from './components/icons'

const reactionList: [
  ReactionTypes,
  ComponentType<ReactionProps>
][] = reactionOrder.map(r => [r, reactionMap[r]])

const messages = {
  title: 'You Received a Tip!',
  sent: 'sent you a tip of',
  audio: '$AUDIO',
  sayThanks: 'Say Thanks With a Reaction',
  reactionSent: 'Reaction Sent!',
  twitterShare: (senderHandle: string, amount: number) =>
    `Thanks ${senderHandle} for the ${amount} $AUDIO tip on @AudiusProject! #Audius #AUDIOTip`
}

type TipReceivedNotificationProps = {
  notification: TipReceive
}

const useSetReaction = (tipTxSignature: string) => {
  const dispatch = useDispatch()

  const setReactionValue = useCallback(
    (reaction: Nullable<ReactionTypes>) => {
      dispatch(writeReactionValue({ reaction, entityId: tipTxSignature }))
    },
    [tipTxSignature, dispatch]
  )
  return setReactionValue
}

export const TipReceivedNotification = (
  props: TipReceivedNotificationProps
) => {
  const [isTileDisabled, setIsTileDisabled] = useState(false)
  const { notification } = props
  const { user, amount, timeLabel, isViewed, tipTxSignature } = notification

  const reactionValue = useSelector(makeGetReactionForSignature(tipTxSignature))
  const setReaction = useSetReaction(tipTxSignature)

  const uiAmount = useUIAudio(amount)

  const handleShare = useCallback(
    (senderHandle: string) => {
      const shareText = messages.twitterShare(senderHandle, uiAmount)
      const analytics = make(
        Name.NOTIFICATIONS_CLICK_TIP_RECEIVED_TWITTER_SHARE,
        { text: shareText }
      )

      return { shareText, analytics }
    },
    [uiAmount]
  )

  const handleMouseEnter = useCallback(() => setIsTileDisabled(true), [])
  const handleMouseLeave = useCallback(() => setIsTileDisabled(false), [])

  return (
    <NotificationTile
      notification={notification}
      disabled={isTileDisabled}
      disableClosePanel
    >
      <NotificationHeader icon={<IconTip />}>
        <NotificationTitle>{messages.title}</NotificationTitle>
      </NotificationHeader>
      <NotificationBody className={styles.body}>
        <div className={styles.bodyText}>
          <ProfilePicture className={styles.profilePicture} user={user} />
          <span>
            <UserNameLink user={user} notification={notification} />{' '}
            {messages.sent} <AudioText value={uiAmount} />
          </span>
        </div>
        <div className={styles.sayThanks}>
          {reactionValue ? (
            <>
              <i className='emoji small white-heavy-check-mark' />{' '}
              {messages.reactionSent}{' '}
            </>
          ) : (
            messages.sayThanks
          )}
        </div>
        <div
          className={styles.reactionList}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {reactionList.map(([reactionType, Reaction]) => (
            <Reaction
              key={reactionType}
              onClick={() => setReaction(reactionType)}
              isActive={
                reactionValue // treat 0 and null equivalently here
                  ? reactionType === reactionValue
                  : undefined
              }
              isResponsive
            />
          ))}
        </div>
      </NotificationBody>
      <TwitterShareButton
        type='dynamic'
        handle={user.handle}
        shareData={handleShare}
      />
      <NotificationFooter timeLabel={timeLabel} isViewed={isViewed} />
    </NotificationTile>
  )
}
