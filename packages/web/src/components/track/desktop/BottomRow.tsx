import { ReactNode, useCallback } from 'react'

import {
  FieldVisibility,
  premiumContentSelectors,
  ID,
  PremiumConditions,
  StringUSDC,
  Nullable,
  formatStringUSDC
} from '@audius/common'
import { IconLock } from '@audius/stems'
import cn from 'classnames'
import { useSelector } from 'react-redux'

import FavoriteButton from 'components/alt-button/FavoriteButton'
import RepostButton from 'components/alt-button/RepostButton'
import ShareButton from 'components/alt-button/ShareButton'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import Tooltip from 'components/tooltip/Tooltip'
import typeStyles from 'components/typography/typography.module.css'

import styles from './TrackTile.module.css'

const { getPremiumTrackStatusMap } = premiumContentSelectors

const messages = {
  repostLabel: 'Repost',
  unrepostLabel: 'Unrepost',
  unlocking: 'Unlocking',
  locked: 'Locked'
}

// TODO: Use version from common once PR is merged
const isPremiumContentUSDCPurchaseGated = (
  premiumConditions: Nullable<PremiumConditions>
): premiumConditions is {
  usdc_purchase: { price: StringUSDC; slot: number }
} => 'usdc_purchase' in (premiumConditions ?? {})

type BottomRowProps = {
  doesUserHaveAccess?: boolean
  isDisabled?: boolean
  isLoading?: boolean
  isFavorited?: boolean
  isReposted?: boolean
  rightActions?: ReactNode
  bottomBar?: ReactNode
  isUnlisted?: boolean
  fieldVisibility?: FieldVisibility
  isOwner: boolean
  isDarkMode?: boolean
  isMatrixMode: boolean
  showIconButtons?: boolean
  isTrack?: boolean
  trackId?: ID
  premiumConditions?: Nullable<PremiumConditions>
  onClickRepost: (e?: any) => void
  onClickFavorite: (e?: any) => void
  onClickShare: (e?: any) => void
}

const PremiumConditionsPill = ({
  premiumConditions,
  unlocking
}: {
  premiumConditions: PremiumConditions
  unlocking: boolean
}) => {
  const isPurchase = isPremiumContentUSDCPurchaseGated(premiumConditions)
  const icon = unlocking ? (
    <LoadingSpinner className={styles.spinner} />
  ) : isPurchase ? null : (
    <IconLock />
  )
  const message = unlocking
    ? messages.unlocking
    : isPurchase
    ? `$${formatStringUSDC(premiumConditions.usdc_purchase.price)}`
    : messages.locked
  const colorStyle = isPurchase ? styles.premiumContent : styles.gatedContent

  return (
    <div className={cn(styles.hasPremiumCondition, colorStyle)}>
      {icon}
      {message}
    </div>
  )
}

export const BottomRow = ({
  doesUserHaveAccess,
  isDisabled,
  isLoading,
  isFavorited,
  isReposted,
  rightActions,
  bottomBar,
  isUnlisted,
  fieldVisibility,
  isOwner,
  isDarkMode,
  isMatrixMode,
  showIconButtons,
  isTrack,
  trackId,
  premiumConditions,
  onClickRepost,
  onClickFavorite,
  onClickShare
}: BottomRowProps) => {
  const premiumTrackStatusMap = useSelector(getPremiumTrackStatusMap)
  const premiumTrackStatus = trackId && premiumTrackStatusMap[trackId]

  const repostLabel = isReposted ? messages.unrepostLabel : messages.repostLabel

  const hideShare: boolean = fieldVisibility
    ? fieldVisibility.share === false
    : false

  const onStopPropagation = useCallback((e: any) => e.stopPropagation(), [])

  const renderShareButton = () => {
    return (
      <Tooltip
        text={'Share'}
        disabled={isDisabled || hideShare}
        placement='top'
        mount='page'
      >
        <div
          className={cn(styles.iconButtonContainer, {
            [styles.isHidden]: hideShare
          })}
          onClick={onStopPropagation}
        >
          <ShareButton
            onClick={onClickShare}
            isDarkMode={!!isDarkMode}
            className={styles.iconButton}
            stopPropagation={false}
            isMatrixMode={isMatrixMode}
          />
        </div>
      </Tooltip>
    )
  }

  if (isTrack && premiumConditions && !isLoading && !doesUserHaveAccess) {
    return (
      <div className={cn(typeStyles.titleSmall, styles.bottomRow)}>
        <PremiumConditionsPill
          premiumConditions={premiumConditions}
          unlocking={premiumTrackStatus === 'UNLOCKING'}
        />
        {!isLoading ? <div>{rightActions}</div> : null}
      </div>
    )
  }

  return (
    <div className={styles.bottomRow}>
      {bottomBar}
      {!isLoading && showIconButtons && isUnlisted && (
        <div className={styles.iconButtons}>{renderShareButton()}</div>
      )}
      {!isLoading && showIconButtons && !isUnlisted && (
        <div className={styles.iconButtons}>
          <Tooltip
            text={repostLabel}
            disabled={isDisabled || isOwner}
            placement='top'
            mount='page'
          >
            <div
              className={cn(styles.iconButtonContainer, {
                [styles.isDisabled]: isOwner,
                [styles.isHidden]: isUnlisted
              })}
            >
              <RepostButton
                aria-label={repostLabel}
                onClick={onClickRepost}
                isActive={isReposted}
                isDisabled={isOwner}
                isDarkMode={!!isDarkMode}
                isMatrixMode={isMatrixMode}
                wrapperClassName={styles.iconButton}
              />
            </div>
          </Tooltip>
          <Tooltip
            text={isFavorited ? 'Unfavorite' : 'Favorite'}
            disabled={isDisabled || isOwner}
            placement='top'
            mount='page'
          >
            <div
              className={cn(styles.iconButtonContainer, {
                [styles.isDisabled]: isOwner,
                [styles.isHidden]: isUnlisted
              })}
            >
              <FavoriteButton
                onClick={onClickFavorite}
                isActive={isFavorited}
                isDisabled={isOwner}
                isDarkMode={!!isDarkMode}
                isMatrixMode={isMatrixMode}
                wrapperClassName={styles.iconButton}
              />
            </div>
          </Tooltip>
          {renderShareButton()}
        </div>
      )}
      {!isLoading ? <div>{rightActions}</div> : null}
    </div>
  )
}
