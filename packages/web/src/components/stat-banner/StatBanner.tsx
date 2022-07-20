import { ReactNode, useRef } from 'react'

import {
  Button,
  ButtonSize,
  ButtonType,
  IconShare,
  IconPencil,
  IconDM
} from '@audius/stems'

import { ArtistRecommendationsPopup } from 'components/artist-recommendations/ArtistRecommendationsPopup'
import FollowButton from 'components/follow-button/FollowButton'
import Stats from 'components/stats/Stats'
import SubscribeButton from 'components/subscribe-button/SubscribeButton'

import styles from './StatBanner.module.css'

const BUTTON_COLLAPSE_WIDTHS = {
  first: 1066,
  second: 1140
}

type StatsBannerProps = {
  areArtistRecommendationsVisible: boolean,
  empty: boolean,
  following: boolean,
  handle: string,
  isSubscribed: boolean,
  mode: 'visitor' | 'owner' | 'editing',
  onCancel: () => void,
  onClickArtistName: () => void,
  onCloseArtistRecommendations: () => void,
  onEdit: () => void,
  onFollow: () => void,
  onSave: () => void,
  onShare: () => void,
  onToggleSubscribe: () => void,
  onUnfollow: () => void,
  profileId: number,
  stats: { number: number; title: string; key: string; }[],
  userId: number
}

export const StatBanner = ({
  areArtistRecommendationsVisible,
  empty,
  following,
  isSubscribed,
  mode,
  onCancel,
  onCloseArtistRecommendations,
  onEdit,
  onFollow,
  onSave,
  onShare,
  onToggleSubscribe,
  onUnfollow,
  profileId,
  stats,
  userId,
}: StatsBannerProps) => {
  let buttonOne: ReactNode = null
  let buttonTwo: ReactNode = null
  let subscribeButton: ReactNode = null
  let dmButton: ReactNode = null

  const followButtonRef = useRef<HTMLElement>(null)

  switch (mode) {
    case 'owner':
      buttonOne = (
        <Button
          size={ButtonSize.SMALL}
          type={ButtonType.COMMON}
          text='SHARE'
          leftIcon={< IconShare />}
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
          leftIcon={< IconPencil />}
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
    case 'visitor':
      buttonOne = (
        <Button
          size={ButtonSize.SMALL}
          type={ButtonType.COMMON}
          text='SHARE'
          leftIcon={< IconShare />}
          onClick={onShare}
          widthToHideText={BUTTON_COLLAPSE_WIDTHS.first}
        />
      )
      buttonTwo = (
        <div ref={followButtonRef} >
          <FollowButton
            following={following}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            widthToHideText={BUTTON_COLLAPSE_WIDTHS.second}
            className={styles.followButton}
          />
          <ArtistRecommendationsPopup
            anchorRef={followButtonRef}
            artistId={profileId}
            isVisible={areArtistRecommendationsVisible}
            onClose={onCloseArtistRecommendations}
          />
        </div>
      )
      if (onToggleSubscribe) {
        subscribeButton = (
          <SubscribeButton
            className={styles.subscribeButton}
            isSubscribed={isSubscribed}
            isFollowing={following}
            onToggleSubscribe={onToggleSubscribe}
          />
        )
      }
      dmButton = (
        <Button
          className={styles.dmButton}
          size={ButtonSize.SMALL}
          type={ButtonType.COMMON}
          text={null}
          leftIcon={< IconDM />}
          onClick={onShare}
        />
      )
      break
  }

  return (
    <div className={styles.wrapper} >
      {!empty ? (
        <div className={styles.statBanner} >
          <div className={styles.stats}>
            <Stats
              clickable
              currentUserId={userId}
              userId={profileId}
              stats={stats}
              size='large'
            />
          </div>
          < div className={styles.buttons} >
            {buttonOne}
            {subscribeButton}
            {dmButton}
            {buttonTwo}
          </div>
          < /div>
      ) : null}
        </div>
      )
}

