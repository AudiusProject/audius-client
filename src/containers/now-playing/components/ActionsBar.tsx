import React, { useCallback, useContext } from 'react'
import {
  IconShare,
  IconKebabHorizontal,
  IconAirplay,
  IconChromecast
} from '@audius/stems'

import IconButton from 'components/general/IconButton'
import { SHARE_TOAST_TIMEOUT_MILLIS } from 'utils/constants'
import { AirplayMessage } from 'services/native-mobile-interface/cast'
import { ShowGoogleCastPickerMessage } from 'services/native-mobile-interface/googleCast'
import cn from 'classnames'
import { Cast } from 'containers/settings-page/store/types'
import styles from './ActionsBar.module.css'
import { isShareToastDisabled } from 'utils/clipboardUtil'
import RepostButton from 'components/general/alt-button/RepostButton'
import FavoriteButton from 'components/general/alt-button/FavoriteButton'
import { ToastContext } from 'components/toast/ToastContext'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

type ActionsBarProps = {
  hasReposted: boolean
  hasFavorited: boolean
  isCasting: boolean
  isOwner: boolean
  castMethod: Cast
  onToggleRepost: () => void
  onToggleFavorite: () => void
  onShare: () => void
  onClickOverflow: () => void
  isDarkMode: boolean
}

const messages = {
  copiedToast: 'Copied To Clipboard'
}

const ActionsBar = ({
  castMethod,
  hasReposted,
  hasFavorited,
  isCasting,
  isOwner,
  onToggleRepost,
  onToggleFavorite,
  onShare,
  onClickOverflow,
  isDarkMode
}: ActionsBarProps) => {
  const { toast } = useContext(ToastContext)
  const handleShare = useCallback(() => {
    if (!isShareToastDisabled) {
      toast(messages.copiedToast, SHARE_TOAST_TIMEOUT_MILLIS)
    }
    onShare()
  }, [onShare, toast])

  const isAirplay = castMethod === Cast.AIRPLAY
  return (
    <div className={styles.actionsBar}>
      {NATIVE_MOBILE && (
        <IconButton
          isActive={isCasting}
          className={cn(styles.icon, styles.iconCast)}
          activeClassName={styles.activeButton}
          icon={isAirplay ? <IconAirplay /> : <IconChromecast />}
          onClick={e => {
            e.stopPropagation()
            const message = isAirplay
              ? new AirplayMessage()
              : new ShowGoogleCastPickerMessage()
            message.send()
          }}
        />
      )}
      <RepostButton
        isDarkMode={isDarkMode}
        isActive={hasReposted}
        isDisabled={isOwner}
        onClick={onToggleRepost}
        wrapperClassName={styles.icon}
        className={styles.repostButton}
        altVariant
      />
      <FavoriteButton
        isActive={hasFavorited}
        isDisabled={isOwner}
        isDarkMode={isDarkMode}
        onClick={onToggleFavorite}
        wrapperClassName={styles.icon}
        className={styles.favoriteButton}
        altVariant
      />
      <IconButton
        icon={<IconShare />}
        onClick={handleShare}
        className={styles.icon}
      />
      <IconButton
        icon={<IconKebabHorizontal />}
        className={styles.icon}
        onClick={e => {
          e.stopPropagation()
          onClickOverflow()
        }}
      />
    </div>
  )
}

export default React.memo(ActionsBar)
