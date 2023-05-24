import { useRef } from 'react'

import { FeatureFlags } from '@audius/common'
import {
  Button,
  ButtonSize,
  ButtonType,
  IconShare,
  IconPencil,
  IconKebabHorizontal,
  IconMessage,
  PopupMenu,
  IconUnblockMessages,
  IconBlockMessages,
  IconMessageLocked
} from '@audius/stems'
import cn from 'classnames'

import { ArtistRecommendationsPopup } from 'components/artist-recommendations/ArtistRecommendationsPopup'
import FollowButton from 'components/follow-button/FollowButton'
import Stats, { StatProps } from 'components/stats/Stats'
import SubscribeButton from 'components/subscribe-button/SubscribeButton'
import { useFlag } from 'hooks/useRemoteConfig'

import styles from './StatBanner.module.css'

const BUTTON_COLLAPSE_WIDTHS = {
  first: 1066,
  second: 1140
}

const messages = {
  more: 'More Options',
  share: 'Share',
  shareProfile: 'Share Profile',
  edit: 'Edit Page',
  cancel: 'Cancel',
  save: 'Save Changes',
  message: 'Send Message',
  unblockMessages: 'Unblock Messages',
  blockMessages: 'Block Messages'
}

export type ProfileMode = 'visitor' | 'owner' | 'editing'

type StatsBannerProps = {
  stats?: StatProps[]
  mode?: ProfileMode
  isEmpty?: boolean
  profileId?: number
  areArtistRecommendationsVisible?: boolean
  onCloseArtistRecommendations?: () => void
  onEdit?: () => void
  onShare?: () => void
  onSave?: () => void
  onCancel?: () => void
  onFollow?: () => void
  onUnfollow?: () => void
  following?: boolean
  isSubscribed?: boolean
  onToggleSubscribe?: () => void
  canCreateChat?: boolean
  onMessage?: () => void
  onBlock?: () => void
  onUnblock?: () => void
  isBlocked?: boolean
  accountUserId?: number | null
}

type StatsMenuPopupProps = {
  onShare: () => void
  accountUserId?: number | null
  isBlocked?: boolean
  onBlock: () => void
  onUnblock: () => void
}

const StatsPopupMenu = ({
  onShare,
  accountUserId,
  isBlocked,
  onBlock,
  onUnblock
}: StatsMenuPopupProps) => {
  const menuItems = [
    {
      text: messages.shareProfile,
      onClick: onShare,
      icon: <IconShare />
    }
  ]

  if (accountUserId) {
    menuItems.push(
      isBlocked
        ? {
            text: messages.unblockMessages,
            onClick: onUnblock,
            icon: <IconUnblockMessages />
          }
        : {
            text: messages.blockMessages,
            onClick: onBlock,
            icon: <IconBlockMessages />
          }
    )
  }
  return (
    <PopupMenu
      items={menuItems}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      renderTrigger={(anchorRef, triggerPopup) => (
        <Button
          ref={anchorRef}
          type={ButtonType.COMMON}
          size={ButtonSize.SMALL}
          className={cn(styles.iconButton, styles.statButton)}
          aria-label={messages.more}
          text={<IconKebabHorizontal />}
          onClick={triggerPopup}
        />
      )}
    />
  )
}

export const StatBanner = (props: StatsBannerProps) => {
  const {
    stats = [
      { number: 0, title: 'tracks' },
      { number: 0, title: 'followers' },
      { number: 0, title: 'reposts' }
    ] as StatProps[],
    mode = 'visitor',
    isEmpty = false,
    profileId,
    areArtistRecommendationsVisible = false,
    onCloseArtistRecommendations,
    onEdit,
    onShare,
    onSave,
    onCancel,
    onFollow,
    onUnfollow,
    following,
    canCreateChat,
    onMessage,
    onBlock,
    onUnblock,
    isBlocked,
    accountUserId,
    isSubscribed,
    onToggleSubscribe
  } = props
  let buttons = null
  const followButtonRef = useRef<HTMLDivElement>(null)

  const { isEnabled: isChatEnabled } = useFlag(FeatureFlags.CHAT_ENABLED)

  switch (mode) {
    case 'owner':
      buttons = (
        <>
          <Button
            className={styles.statButton}
            size={ButtonSize.SMALL}
            type={ButtonType.COMMON}
            text={messages.share}
            onClick={onShare}
            widthToHideText={BUTTON_COLLAPSE_WIDTHS.first}
          />
          <Button
            className={cn(styles.buttonTwo, styles.statButton)}
            size={ButtonSize.SMALL}
            type={ButtonType.SECONDARY}
            text={messages.edit}
            leftIcon={<IconPencil />}
            onClick={onEdit}
            widthToHideText={BUTTON_COLLAPSE_WIDTHS.second}
          />
        </>
      )
      break
    case 'editing':
      buttons = (
        <>
          <Button
            className={styles.statButton}
            size={ButtonSize.SMALL}
            type={ButtonType.COMMON}
            text={messages.cancel}
            onClick={onCancel}
          />
          <Button
            className={cn(styles.buttonTwo, styles.statButton)}
            size={ButtonSize.SMALL}
            type={ButtonType.PRIMARY_ALT}
            text={messages.save}
            onClick={onSave}
          />
        </>
      )
      break
    default:
      buttons = (
        <>
          {isChatEnabled && onShare && onUnblock && onBlock ? (
            <>
              <StatsPopupMenu
                onShare={onShare}
                accountUserId={accountUserId}
                isBlocked={isBlocked}
                onBlock={onBlock}
                onUnblock={onUnblock}
              />
              {onMessage ? (
                <Button
                  type={ButtonType.COMMON}
                  size={ButtonSize.SMALL}
                  className={cn(styles.iconButton, styles.statButton, {
                    [styles.disabled]: !canCreateChat
                  })}
                  aria-label={messages.message}
                  text={canCreateChat ? <IconMessage /> : <IconMessageLocked />}
                  onClick={onMessage}
                />
              ) : null}
            </>
          ) : (
            <Button
              type={ButtonType.COMMON}
              size={ButtonSize.SMALL}
              className={cn(styles.statButton)}
              text={messages.share}
              leftIcon={<IconShare />}
              onClick={onShare!}
            />
          )}

          <div className={styles.followContainer}>
            {onToggleSubscribe ? (
              <SubscribeButton
                className={styles.subscribeButton}
                isSubscribed={isSubscribed!}
                isFollowing={following!}
                onToggleSubscribe={onToggleSubscribe}
              />
            ) : null}
            <div ref={followButtonRef}>
              <FollowButton
                following={following}
                onFollow={onFollow}
                onUnfollow={onUnfollow}
                widthToHideText={BUTTON_COLLAPSE_WIDTHS.second}
                className={styles.statButton}
              />
              <ArtistRecommendationsPopup
                anchorRef={followButtonRef}
                artistId={profileId!}
                isVisible={areArtistRecommendationsVisible}
                onClose={onCloseArtistRecommendations!}
              />
            </div>
          </div>
        </>
      )
      break
  }

  return (
    <div className={styles.wrapper}>
      {!isEmpty ? (
        <div className={styles.statBanner}>
          <div className={styles.stats}>
            <Stats clickable userId={profileId!} stats={stats} size='large' />
          </div>
          <div className={styles.buttons}>{buttons}</div>
        </div>
      ) : null}
    </div>
  )
}
