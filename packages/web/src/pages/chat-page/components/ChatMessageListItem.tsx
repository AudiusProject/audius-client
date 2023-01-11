import { useCallback, useRef, useState } from 'react'

import {
  accountSelectors,
  chatActions,
  decodeHashId,
  ReactionTypes
} from '@audius/common'
import type { ChatMessage } from '@audius/sdk'
import { IconSave, PopupPosition } from '@audius/stems'
import cn from 'classnames'
import dayjs from 'dayjs'
import { useDispatch } from 'react-redux'

import StarEyesSrc from 'assets/fonts/emojis/grinning-face-with-star-eyes.png'
import FrownFaceSrc from 'assets/fonts/emojis/slightly-frowning-face.png'
import HornFaceSrc from 'assets/fonts/emojis/smiling-face-with-horns.png'
import SunglassesSrc from 'assets/fonts/emojis/smiling-face-with-sunglasses.png'
import { useSelector } from 'common/hooks/useSelector'

import styles from './ChatMessageListItem.module.css'
import { ReactionPopupMenu } from './ReactionPopupMenu'

type ChatMessageListItemProps = {
  chatId: string
  message: ChatMessage
}

const reactionImageMap: Record<ReactionTypes, string> = {
  heart: StarEyesSrc,
  explode: HornFaceSrc,
  fire: SunglassesSrc,
  party: FrownFaceSrc
}

const formatMessageDate = (date: string) => {
  const d = dayjs(date)
  const today = dayjs()
  if (d.isBefore(today, 'week')) return d.format('M/D/YY h:mm A')
  if (d.isBefore(today, 'day')) return d.format('dddd h:mm A')
  return d.format('h:mm A')
}

export const ChatMessageListItem = (props: ChatMessageListItemProps) => {
  const { chatId, message } = props
  const reactionButtonRef = useRef<HTMLDivElement>(null)
  const dispatch = useDispatch()
  const [isReactionPopupVisible, setReactionPopupVisible] = useState(false)
  const senderUserId = decodeHashId(message.sender_user_id)
  const userId = useSelector(accountSelectors.getUserId)
  const isAuthor = userId === senderUserId

  const handleOpenReactionPopupButtonClicked = useCallback(
    () => setReactionPopupVisible((isVisible) => !isVisible),
    [setReactionPopupVisible]
  )
  const handleCloseReactionPopup = useCallback(
    () => setReactionPopupVisible(false),
    [setReactionPopupVisible]
  )
  const handleReactionSelected = useCallback(
    (reaction: ReactionTypes) => {
      dispatch(
        chatActions.setMessageReaction({
          chatId,
          messageId: message.message_id,
          reaction
        })
      )
      handleCloseReactionPopup()
    },
    [dispatch, handleCloseReactionPopup, chatId, message]
  )

  return (
    <div
      className={cn(styles.root, {
        [styles.isAuthor]: isAuthor
      })}
    >
      <div className={styles.bubble}>
        <div className={styles.text}>{message.message}</div>
        <div
          ref={reactionButtonRef}
          className={cn(styles.reaction, {
            [styles.isOpened]: isReactionPopupVisible,
            [styles.hasReaction]:
              message.reactions && message.reactions.length > 0
          })}
          onClick={handleOpenReactionPopupButtonClicked}
        >
          {message.reactions ? (
            message.reactions.map((reaction) => {
              const Reaction =
                reaction.reaction in reactionImageMap
                  ? reactionImageMap[reaction.reaction as ReactionTypes]
                  : reaction.reaction
              return (
                <img
                  key={reaction.user_id}
                  className={styles.reactionImage}
                  src={Reaction}
                />
              )
            })
          ) : (
            <IconSave
              width={28}
              height={28}
              className={styles.addReactionIcon}
            />
          )}
        </div>
      </div>
      <ReactionPopupMenu
        anchorRef={reactionButtonRef}
        isVisible={isReactionPopupVisible}
        onClose={handleCloseReactionPopup}
        position={
          isAuthor ? PopupPosition.BOTTOM_RIGHT : PopupPosition.BOTTOM_LEFT
        }
        onSelected={handleReactionSelected}
      />
      <div className={styles.date}>{formatMessageDate(message.created_at)}</div>
    </div>
  )
}
