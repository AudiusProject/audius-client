import React, { memo, useCallback } from 'react'

import { IconDownload } from '@audius/stems'
import cn from 'classnames'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'

import { ID } from 'common/models/Identifiers'
import IconButton from 'components/icon-button/IconButton'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import Tooltip from 'components/tooltip/Tooltip'
import {
  openSignOn,
  updateRouteOnExit,
  updateRouteOnCompletion,
  showRequiresAccountModal
} from 'pages/sign-on/store/actions'

import {
  ButtonState,
  ButtonType,
  useDownloadTrackButtons
} from '../../common/hooks/useDownloadTrackButtons'

import styles from './DownloadButtons.module.css'

export type DownloadButtonProps = {
  state: ButtonState
  type: ButtonType
  label: string
  onClick?: () => void
}

export const messages = {
  downloadableTrack: 'Download this Track',
  downloadableStem: 'Download this source file',
  followToDownload: 'Must follow artist to download',
  processingTrack: 'Processing',
  processingStem: 'Uploading',
  addDownloadPrefix: (label: string) => `Download ${label}`
}

const DownloadButton = ({
  label,
  state,
  type,
  onClick = () => {}
}: DownloadButtonProps) => {
  const shouldShowTooltip =
    state === ButtonState.PROCESSING || state === ButtonState.REQUIRES_FOLLOW

  const getTooltipText = () => {
    switch (state) {
      case ButtonState.PROCESSING:
        return type === ButtonType.STEM
          ? messages.processingStem
          : messages.processingTrack
      case ButtonState.REQUIRES_FOLLOW:
        return messages.followToDownload
      case ButtonState.LOG_IN_REQUIRED:
      case ButtonState.DOWNLOADABLE:
        switch (type) {
          case ButtonType.STEM:
            return messages.downloadableStem
          case ButtonType.TRACK:
            return messages.downloadableTrack
        }
    }
  }

  const renderIcon = () => {
    if (state === ButtonState.PROCESSING) {
      return (
        <div className={styles.iconProcessingContainer}>
          <LoadingSpinner className={styles.iconProcessing} />
        </div>
      )
    }

    return (
      <div className={styles.iconDownload}>
        <IconButton icon={<IconDownload />} />
      </div>
    )
  }

  const renderButton = () => {
    const isDisabled =
      state === ButtonState.PROCESSING || state === ButtonState.REQUIRES_FOLLOW

    return (
      <div
        className={cn(styles.downloadButtonContainer, {
          [styles.disabled]: isDisabled
        })}
        onClick={isDisabled ? () => {} : onClick}
      >
        <div className={styles.icon}>{renderIcon()}</div>
        {/* h2 here for SEO purposes */}
        <h2 className={styles.label}>{messages.addDownloadPrefix(label)}</h2>
      </div>
    )
  }

  return shouldShowTooltip ? (
    <Tooltip text={getTooltipText()} placement='top' mouseEnterDelay={0}>
      {renderButton()}
    </Tooltip>
  ) : (
    renderButton()
  )
}

type DownloadButtonsProps = {
  trackId: ID
  onDownload: (
    trackId: ID,
    cid: string,
    category?: string,
    parentTrackId?: ID
  ) => void
  isOwner: boolean
  following: boolean
  isHidden?: boolean
  className?: string
}

const DownloadButtons = ({
  trackId,
  isOwner,
  following,
  onDownload,
  className
}: DownloadButtonsProps) => {
  const dispatch = useDispatch()
  const { pathname } = useLocation()

  const onNotLoggedInClick = useCallback(() => {
    dispatch(updateRouteOnCompletion(pathname))
    dispatch(updateRouteOnExit(pathname))
    dispatch(openSignOn())
    dispatch(showRequiresAccountModal())
  }, [dispatch, pathname])

  const buttons = useDownloadTrackButtons({
    trackId,
    onDownload,
    isOwner,
    following,
    onNotLoggedInClick
  })
  const shouldHide = buttons.length === 0
  if (shouldHide) {
    return null
  }

  return (
    <div
      className={cn({
        [className!]: !!className
      })}
    >
      {buttons.map(DownloadButton)}
    </div>
  )
}

export default memo(DownloadButtons)
