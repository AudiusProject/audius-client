import React, { useCallback } from 'react'

import { IconLink, IconShare, IconTwitterBird } from '@audius/stems'
import cn from 'classnames'

import ActionDrawer from 'components/action-drawer/ActionDrawer'
import { isDarkMode } from 'utils/theme/theme'

import { messages } from '../messages'
import { ShareProps } from '../types'

import { IconTikTok } from './IconTikTok'
import styles from './ShareDrawer.module.css'

type ShareDrawerProps = ShareProps

export const ShareDrawer = ({
  onShareToTwitter,
  onShareToTikTok,
  onCopyLink,
  isOpen,
  onClose,
  showTikTokShareAction,
  shareType
}: ShareDrawerProps) => {
  const getActions = useCallback(() => {
    const shareToTwitterAction = {
      icon: <IconTwitterBird height={20} width={26} />,
      text: messages.twitter,
      className: styles.shareToTwitterAction,
      onClick: onShareToTwitter
    }

    const shareToTikTokAction = {
      text: messages.tikTok,
      icon: <IconTikTok height={26} width={26} />,
      className: cn(styles.shareToTikTokAction, {
        [styles.shareToTikTokActionDark]: isDarkMode()
      }),
      onClick: onShareToTikTok
    }

    const copyLinkAction = {
      text: messages.copyLink(shareType),
      icon: <IconLink height={26} width={26} />,
      className: styles.copyLinkAction,
      onClick: onCopyLink
    }

    return showTikTokShareAction
      ? [shareToTwitterAction, shareToTikTokAction, copyLinkAction]
      : [shareToTwitterAction, copyLinkAction]
  }, [
    showTikTokShareAction,
    onShareToTwitter,
    onShareToTikTok,
    onCopyLink,
    shareType
  ])

  return (
    <ActionDrawer
      renderTitle={() => (
        <div className={styles.titleContainer}>
          <IconShare className={styles.titleIcon} />
          <h2 className={styles.title}>{messages.modalTitle(shareType)}</h2>
        </div>
      )}
      actions={getActions()}
      onClose={onClose}
      isOpen={isOpen}
      classes={{ actionItem: styles.actionItem }}
    />
  )
}
