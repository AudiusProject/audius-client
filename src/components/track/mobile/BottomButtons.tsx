import React, { memo, useContext } from 'react'

import FavoriteButton from 'components/general/alt-button/FavoriteButton'
import MoreButton from 'components/general/alt-button/MoreButton'
import RepostButton from 'components/general/alt-button/RepostButton'
import ShareButton from 'components/general/alt-button/ShareButton'
import { ToastContext } from 'components/toast/ToastContext'
import { isShareToastDisabled } from 'utils/clipboardUtil'
import { SHARE_TOAST_TIMEOUT_MILLIS } from 'utils/constants'

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
  isMatrixMode: boolean
}

const messages = {
  copiedToast: 'Copied To Clipboard'
}

const BottomButtons = (props: BottomButtonsProps) => {
  const { toast } = useContext(ToastContext)

  const repostButton = (
    <RepostButton
      onClick={() => props.toggleRepost()}
      isActive={props.hasReposted}
      isDisabled={props.isOwner}
      isUnlisted={props.isUnlisted}
      isDarkMode={props.isDarkMode}
      isMatrixMode={props.isMatrixMode}
    />
  )

  const favoriteButton = (
    <FavoriteButton
      onClick={() => props.toggleSave()}
      isActive={props.hasSaved}
      isDisabled={props.isOwner}
      isUnlisted={props.isUnlisted}
      isDarkMode={props.isDarkMode}
      isMatrixMode={props.isMatrixMode}
    />
  )

  const shareButton = (
    <ShareButton
      onClick={() => {
        if (!isShareToastDisabled) {
          toast(messages.copiedToast, SHARE_TOAST_TIMEOUT_MILLIS)
        }
        props.onShare()
      }}
      isDarkMode={props.isDarkMode}
      isMatrixMode={props.isMatrixMode}
      isShareHidden={props.isShareHidden}
    />
  )

  const moreButton = (
    <MoreButton
      onClick={props.onClickOverflow}
      isDarkMode={props.isDarkMode}
      isMatrixMode={props.isMatrixMode}
    />
  )

  return props.isUnlisted ? (
    <div className={styles.bottomButtons}>
      {shareButton}
      {moreButton}
    </div>
  ) : (
    <div className={styles.bottomButtons}>
      {repostButton}
      {favoriteButton}
      {shareButton}
      {moreButton}
    </div>
  )
}

export default memo(BottomButtons)
