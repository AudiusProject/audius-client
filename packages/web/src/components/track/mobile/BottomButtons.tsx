import { memo } from 'react'

import { PremiumTrackStatus } from '@audius/common'
import { IconLock } from '@audius/stems'
import cn from 'classnames'

import FavoriteButton from 'components/alt-button/FavoriteButton'
import MoreButton from 'components/alt-button/MoreButton'
import RepostButton from 'components/alt-button/RepostButton'
import ShareButton from 'components/alt-button/ShareButton'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import typeStyles from 'components/typography/typography.module.css'

import styles from './BottomButtons.module.css'

type BottomButtonsProps = {
  hasSaved: boolean
  hasReposted: boolean
  toggleSave: () => void
  toggleRepost: () => void
  onClickOverflow: () => void
  onShare: () => void
  isOwner: boolean
  isDarkMode: boolean
  isUnlisted?: boolean
  isShareHidden?: boolean
  isTrack?: boolean
  doesUserHaveAccess?: boolean
  premiumTrackStatus?: PremiumTrackStatus
  isMatrixMode: boolean
}

const messages = {
  locked: 'LOCKED',
  unlocking: 'UNLOCKING'
}

const BottomButtons = (props: BottomButtonsProps) => {
  const moreButton = (
    <MoreButton
      wrapperClassName={styles.button}
      className={styles.buttonContent}
      onClick={props.onClickOverflow}
      isDarkMode={props.isDarkMode}
      isMatrixMode={props.isMatrixMode}
    />
  )

  // Premium condition without access
  if (props.isTrack && !props.doesUserHaveAccess) {
    return (
      <div className={cn(typeStyles.titleSmall, styles.bottomButtons)}>
        <div className={styles.premiumContentContainer}>
          {props.premiumTrackStatus === 'UNLOCKING' ? (
            <div className={styles.premiumContent}>
              <LoadingSpinner className={styles.spinner} />
              {messages.unlocking}
            </div>
          ) : (
            <div className={styles.premiumContent}>
              <IconLock />
              {messages.locked}
            </div>
          )}
        </div>
        {moreButton}
      </div>
    )
  }

  const shareButton = (
    <ShareButton
      wrapperClassName={styles.button}
      className={styles.buttonContent}
      onClick={props.onShare}
      isDarkMode={props.isDarkMode}
      isMatrixMode={props.isMatrixMode}
      isShareHidden={props.isShareHidden}
    />
  )

  if (props.isUnlisted) {
    return (
      <div className={styles.bottomButtons}>
        <div className={styles.actions}>{shareButton}</div>
        {moreButton}
      </div>
    )
  }

  return (
    <div className={styles.bottomButtons}>
      <div className={styles.actions}>
        <RepostButton
          wrapperClassName={styles.button}
          className={styles.buttonContent}
          onClick={props.toggleRepost}
          isActive={props.hasReposted}
          isDisabled={props.isOwner}
          isUnlisted={props.isUnlisted}
          isDarkMode={props.isDarkMode}
          isMatrixMode={props.isMatrixMode}
        />
        <FavoriteButton
          wrapperClassName={styles.button}
          className={styles.buttonContent}
          onClick={props.toggleSave}
          isActive={props.hasSaved}
          isDisabled={props.isOwner}
          isUnlisted={props.isUnlisted}
          isDarkMode={props.isDarkMode}
          isMatrixMode={props.isMatrixMode}
        />
        {shareButton}
      </div>
      {moreButton}
    </div>
  )
}

export default memo(BottomButtons)
