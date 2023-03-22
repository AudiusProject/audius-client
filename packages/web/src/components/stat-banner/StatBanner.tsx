import { useRef } from 'react'

import {
  Button,
  ButtonSize,
  ButtonType,
  IconShare,
  IconPencil
} from '@audius/stems'

import { ArtistRecommendationsPopup } from 'components/artist-recommendations/ArtistRecommendationsPopup'
import FollowButton from 'components/follow-button/FollowButton'
import Stats, { StatProps } from 'components/stats/Stats'
import SubscribeButton from 'components/subscribe-button/SubscribeButton'

import styles from './StatBanner.module.css'

const BUTTON_COLLAPSE_WIDTHS = {
  first: 1066,
  second: 1140
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

  let buttonOne, buttonTwo, subscribeButton
  const followButtonRef = useRef<HTMLDivElement>(null)

  switch (mode) {
    case 'owner':
      buttonOne = (
        <Button
          size={ButtonSize.SMALL}
          type={ButtonType.COMMON}
          text='SHARE'
          leftIcon={<IconShare />}
          onClick={onShare}
          widthToHideText={BUTTON_COLLAPSE_WIDTHS.first}
        />
      )
      buttonTwo = (
        <Button
          key='edit'
          className={styles.buttonTwo}
          size={ButtonSize.SMALL}
          type={ButtonType.SECONDARY}
          text='EDIT PAGE'
          leftIcon={<IconPencil />}
          onClick={onEdit}
          widthToHideText={BUTTON_COLLAPSE_WIDTHS.second}
        />
      )
      break
    case 'editing':
      buttonOne = (
        <Button
          size={ButtonSize.SMALL}
          type={ButtonType.COMMON}
          text='CANCEL'
          onClick={onCancel}
        />
      )
      buttonTwo = (
        <Button
          key='save'
          className={styles.buttonTwo}
          size={ButtonSize.SMALL}
          type={ButtonType.PRIMARY_ALT}
          text='SAVE CHANGES'
          onClick={onSave}
        />
      )
      break
    default:
      buttonOne = (
        <Button
          size={ButtonSize.SMALL}
          type={ButtonType.COMMON}
          text='SHARE'
          leftIcon={<IconShare />}
          onClick={onShare}
          widthToHideText={BUTTON_COLLAPSE_WIDTHS.first}
        />
      )
      buttonTwo = (
        <div ref={followButtonRef}>
          <FollowButton
            following={following}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            widthToHideText={BUTTON_COLLAPSE_WIDTHS.second}
            className={styles.followButton}
          />
          <ArtistRecommendationsPopup
            anchorRef={followButtonRef}
            artistId={profileId!}
            isVisible={areArtistRecommendationsVisible}
            onClose={onCloseArtistRecommendations!}
          />
        </div>
      )
      if (onToggleSubscribe) {
        subscribeButton = (
          <SubscribeButton
            className={styles.subscribeButton}
            isSubscribed={isSubscribed!}
            isFollowing={following!}
            onToggleSubscribe={onToggleSubscribe}
          />
        )
      }
      break
  }

  return (
    <div className={styles.wrapper}>
      {!isEmpty ? (
        <div className={styles.statBanner}>
          <div className={styles.stats}>
            <Stats clickable userId={profileId!} stats={stats} size='large' />
          </div>
          <div className={styles.buttons}>
            {buttonOne}
            {subscribeButton}
            {buttonTwo}
          </div>
        </div>
      ) : null}
    </div>
  )
}
