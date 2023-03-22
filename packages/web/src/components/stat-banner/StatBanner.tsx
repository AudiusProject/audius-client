import { useRef } from 'react'

import { FeatureFlags } from '@audius/common'
import {
  Button,
  ButtonSize,
  ButtonType,
  IconShare,
  IconPencil,
  IconKebabHorizontal,
  IconMessage
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
  edit: 'Edit Page',
  cancel: 'Cancel',
  save: 'Save Changes',
  message: 'Send Message'
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
            leftIcon={<IconShare />}
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
          {isChatEnabled ? (
            <Button
              type={ButtonType.COMMON}
              size={ButtonSize.SMALL}
              className={cn(styles.iconButton, styles.statButton)}
              aria-label={messages.more}
              text={<IconKebabHorizontal />}
              onClick={() => {}}
            />
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
