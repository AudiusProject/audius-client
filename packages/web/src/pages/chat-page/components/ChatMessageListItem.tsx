import { useCallback, useRef, useState } from 'react'

import {
  accountSelectors,
  cacheUsersSelectors,
  chatActions,
  decodeHashId,
  encodeHashId,
  ReactionTypes,
  useProxySelector,
  formatMessageDate,
  isAudiusUrl,
  getPathFromAudiusUrl,
  isTrackUrl,
  isCollectionUrl,
  ChatMessageWithExtras,
  Status,
  useCanSendMessage
} from '@audius/common'
import { IconError, IconPlus, PopupPosition } from '@audius/stems'
import cn from 'classnames'
import { push as pushRoute } from 'connected-react-router'
import Linkify from 'linkify-react'
import { find } from 'linkifyjs'
import { useDispatch } from 'react-redux'

import { useSelector } from 'common/hooks/useSelector'
import { reactionMap } from 'components/notification/Notification/components/Reaction'

import { ReactComponent as ChatTail } from '../../../assets/img/ChatTail.svg'

import styles from './ChatMessageListItem.module.css'
import { ChatMessagePlaylist } from './ChatMessagePlaylist'
import { ChatMessageTrack } from './ChatMessageTrack'
import { LinkPreview } from './LinkPreview'
import { ReactionPopupMenu } from './ReactionPopupMenu'

const { setMessageReaction, sendMessage } = chatActions
const { getUserId } = accountSelectors

type ChatMessageListItemProps = {
  chatId: string
  message: ChatMessageWithExtras
  hasTail: boolean
}

const messages = {
  error: 'Message Failed to Send. Click to Retry.'
}

export const ChatMessageListItem = (props: ChatMessageListItemProps) => {
  const { chatId, message, hasTail } = props

  // Refs
  const reactionButtonRef = useRef<HTMLDivElement>(null)
  const dispatch = useDispatch()

  // State
  const [isReactionPopupVisible, setReactionPopupVisible] = useState(false)
  const [emptyUnfurl, setEmptyUnfurl] = useState(false)

  // Selectors
  const userId = useSelector(getUserId)
  const reactionUsers = useProxySelector(
    (state) =>
      cacheUsersSelectors.getUsers(state, {
        ids: message.reactions?.map((r) => decodeHashId(r.user_id)!)
      }),
    [message]
  )

  // Derived
  const senderUserId = decodeHashId(message.sender_user_id)
  const isAuthor = userId === senderUserId
  const links = find(message.message)
  const link = links.filter((link) => link.type === 'url' && link.isLink)[0]
  const linkValue = link?.value
  const isUnfurlOnly = linkValue === message.message.trim()
  const hideMessage = isUnfurlOnly && !emptyUnfurl

  // Callbacks
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
      if (userId) {
        dispatch(
          setMessageReaction({
            userId,
            chatId,
            messageId: message.message_id,
            reaction:
              message.reactions?.find((r) => r.user_id === encodeHashId(userId))
                ?.reaction === reaction
                ? null
                : reaction
          })
        )
      }
      handleCloseReactionPopup()
    },
    [dispatch, handleCloseReactionPopup, userId, chatId, message]
  )

  const onClickInternalLink = useCallback(
    (url: string) => {
      dispatch(pushRoute(url))
    },
    [dispatch]
  )

  const handleResendClicked = useCallback(() => {
    dispatch(
      sendMessage({
        chatId,
        message: message.message,
        resendMessageId: message.message_id
      })
    )
  }, [dispatch, chatId, message.message, message.message_id])

  const onUnfurlEmpty = useCallback(() => {
    if (linkValue) {
      setEmptyUnfurl(true)
    }
  }, [linkValue])

  const onUnfurlSuccess = useCallback(() => {
    if (linkValue) {
      setEmptyUnfurl(false)
    }
  }, [linkValue])

  // Only render reactions if user has message permissions
  const { canSendMessage } = useCanSendMessage(chatId)
  const renderReactions = () => {
    if (!canSendMessage) return null

    return (
      <div
        ref={reactionButtonRef}
        className={cn(styles.reactionsContainer, {
          [styles.isOpened]: isReactionPopupVisible,
          [styles.hasReaction]:
            message.reactions && message.reactions.length > 0
        })}
        onClick={handleOpenReactionPopupButtonClicked}
      >
        {message.reactions?.length > 0 ? (
          message.reactions.map((reaction) => {
            if (!reaction.reaction || !(reaction.reaction in reactionMap)) {
              return null
            }
            const Reaction = reactionMap[reaction.reaction as ReactionTypes]
            return (
              <Reaction
                className={styles.reactionEmoji}
                key={reaction.user_id}
                width={48}
                height={48}
                title={reactionUsers[decodeHashId(reaction.user_id)!]?.name}
                disableClickAnimation
              />
            )
          })
        ) : (
          <div className={cn(styles.reactionsButton)}>
            <IconPlus className={styles.addReactionIcon} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(styles.root, {
        [styles.isAuthor]: isAuthor,
        [styles.hasReaction]: !hasTail && message.reactions?.length > 0
      })}
    >
      <div
        className={cn(styles.bubble, {
          [styles.nonInteractive]: !canSendMessage,
          [styles.hideMessage]: hideMessage
        })}
      >
        <div className={styles.bubbleCorners}>
          {isCollectionUrl(linkValue) ? (
            <ChatMessagePlaylist
              className={styles.unfurl}
              link={link.value}
              onEmpty={onUnfurlEmpty}
              onSuccess={onUnfurlSuccess}
            />
          ) : isTrackUrl(linkValue) ? (
            <ChatMessageTrack
              className={styles.unfurl}
              link={link.value}
              onEmpty={onUnfurlEmpty}
              onSuccess={onUnfurlSuccess}
            />
          ) : link ? (
            <LinkPreview
              className={styles.unfurl}
              href={link.href}
              chatId={chatId}
              messageId={message.message_id}
              onEmpty={onUnfurlEmpty}
              onSuccess={onUnfurlSuccess}
            />
          ) : null}
          {!hideMessage ? (
            <div className={styles.text}>
              <Linkify
                options={{
                  attributes: {
                    onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
                      const url = event.currentTarget.href

                      if (isAudiusUrl(url)) {
                        const path = getPathFromAudiusUrl(url)
                        event.nativeEvent.preventDefault()
                        onClickInternalLink(path ?? '/')
                      }
                    }
                  },
                  target: (href) => {
                    return isAudiusUrl(href) ? '' : '_blank'
                  }
                }}
              >
                {message.message}
              </Linkify>
            </div>
          ) : null}
        </div>
        {renderReactions()}
        {hasTail ? (
          <div className={styles.tail}>
            <ChatTail />
          </div>
        ) : null}
      </div>
      {canSendMessage ? (
        <ReactionPopupMenu
          anchorRef={reactionButtonRef}
          isVisible={isReactionPopupVisible}
          onClose={handleCloseReactionPopup}
          position={
            isAuthor ? PopupPosition.BOTTOM_RIGHT : PopupPosition.BOTTOM_LEFT
          }
          onSelected={handleReactionSelected}
        />
      ) : null}
      {message.status === Status.ERROR ? (
        <div
          className={cn(styles.meta, styles.error)}
          onClick={handleResendClicked}
        >
          <IconError /> {messages.error}
        </div>
      ) : hasTail ? (
        <div className={styles.meta}>
          {formatMessageDate(message.created_at)}
        </div>
      ) : null}
    </div>
  )
}
