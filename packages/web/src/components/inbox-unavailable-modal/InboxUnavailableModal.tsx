import { ReactNode, useCallback } from 'react'

import {
  CHAT_BLOG_POST_URL,
  ChatPermissionAction,
  User,
  accountSelectors,
  chatActions,
  chatSelectors,
  makeChatId,
  tippingActions,
  useInboxUnavailableModal
} from '@audius/common'
import {
  IconMessageLocked,
  IconTipping,
  ModalTitle,
  Modal,
  ModalHeader,
  Button,
  ModalContent,
  ModalFooter,
  ButtonType,
  IconUnblockMessages
} from '@audius/stems'
import { useDispatch } from 'react-redux'

import { UserNameAndBadges } from 'components/user-name-and-badges/UserNameAndBadges'
import { useSelector } from 'utils/reducer'

import styles from './InboxUnavailableModal.module.css'

const { unblockUser, createChat } = chatActions

const messages = {
  title: 'Inbox Unavailable',
  content: "You can't send messages to this person.",
  button: 'Learn More',
  tipContent: (displayName: ReactNode) => (
    <>
      {'You must send '}
      {displayName}
      {' a tip before you can send them messages.'}
    </>
  ),
  tipButton: 'Send $AUDIO',
  unblockContent: 'You cannot send messages to users you have blocked.',
  unblockButton: 'Unblock'
}

const actionToContent = ({
  action,
  user,
  onClose
}: {
  action: ChatPermissionAction
  user?: User
  onClose: () => void
}) => {
  switch (action) {
    case ChatPermissionAction.NONE:
      return {
        content: messages.content,
        buttonText: messages.button,
        buttonIcon: null
      }
    case ChatPermissionAction.TIP:
      return {
        content: messages.tipContent(
          user ? (
            <UserNameAndBadges user={user} onNavigateAway={onClose} />
          ) : (
            'this user'
          )
        ),
        buttonText: messages.tipButton,
        buttonIcon: <IconTipping />
      }
    case ChatPermissionAction.UNBLOCK:
      return {
        content: messages.unblockContent,
        buttonText: messages.unblockButton,
        buttonIcon: <IconUnblockMessages />
      }
    default:
      return {
        content: messages.content,
        buttonText: messages.button,
        buttonIcon: null
      }
  }
}

const { beginTip } = tippingActions
const { getCanCreateChat } = chatSelectors

export const InboxUnavailableModal = () => {
  const { isOpen, onClose, onClosed, data } = useInboxUnavailableModal()
  const { user, presetMessage, onCancelAction } = data
  const dispatch = useDispatch()
  const currentUserId = useSelector(accountSelectors.getUserId)
  const { callToAction } = useSelector((state) =>
    getCanCreateChat(state, { userId: user?.user_id })
  )
  const hasAction =
    callToAction === ChatPermissionAction.TIP ||
    callToAction === ChatPermissionAction.UNBLOCK

  const handleClick = useCallback(() => {
    if (!user) return
    if (callToAction === ChatPermissionAction.TIP && currentUserId) {
      const chatId = makeChatId([currentUserId, user.user_id])
      dispatch(
        beginTip({
          user,
          source: 'inboxUnavailableModal',
          onSuccessAction: chatActions.goToChat({
            chatId,
            presetMessage
          }),
          onSuccessConfirmedAction: chatActions.createChat({
            userIds: [user.user_id],
            skipNavigation: true
          })
        })
      )
    } else if (callToAction === ChatPermissionAction.UNBLOCK) {
      dispatch(unblockUser({ userId: user.user_id }))
      dispatch(createChat({ userIds: [user.user_id], presetMessage }))
    } else {
      window.open(CHAT_BLOG_POST_URL, '_blank')
    }
    onClose()
  }, [callToAction, currentUserId, user, dispatch, presetMessage, onClose])

  const handleCancel = useCallback(() => {
    if (onCancelAction) {
      dispatch(onCancelAction)
    }
    onClose()
  }, [dispatch, onCancelAction, onClose])

  const { content, buttonText, buttonIcon } = actionToContent({
    action: callToAction,
    user,
    onClose
  })

  return (
    <Modal
      bodyClassName={styles.modalBody}
      isOpen={isOpen}
      onClose={onClose}
      onClosed={onClosed}
    >
      <ModalHeader onClose={handleCancel}>
        <ModalTitle
          icon={<IconMessageLocked className={styles.icon} />}
          title={messages.title}
        />
      </ModalHeader>
      <ModalContent className={styles.content}>{content}</ModalContent>
      <ModalFooter className={styles.footer}>
        <Button
          className={styles.button}
          type={hasAction ? ButtonType.PRIMARY_ALT : ButtonType.COMMON_ALT}
          text={buttonText}
          leftIcon={buttonIcon}
          onClick={handleClick}
        />
      </ModalFooter>
    </Modal>
  )
}
