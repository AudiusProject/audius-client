import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import cn from 'classnames'

import Menu from 'containers/menu/Menu'

import {
  repostTrack,
  undoRepostTrack,
  shareTrack
} from 'store/social/tracks/actions'
import {
  repostCollection,
  undoRepostCollection,
  shareCollection
} from 'store/social/collections/actions'
import { isShareToastDisabled } from 'utils/clipboardUtil'
import { getUserHandle } from 'store/account/selectors'

import Toast from 'components/toast/Toast'
import styles from './ActionsTab.module.css'
import { ReactComponent as IconKebabHorizontal } from 'assets/img/iconKebabHorizontal.svg'
import { ReactComponent as IconRepost } from 'assets/img/iconRepost.svg'
import { ReactComponent as IconShare } from 'assets/img/iconShare.svg'
import Tooltip from 'components/tooltip/Tooltip'
import {
  REPOST_TOAST_TIMEOUT_MILLIS,
  SHARE_TOAST_TIMEOUT_MILLIS
} from 'utils/constants'
import { ShareSource, RepostSource } from 'services/analytics'

const MinimizedActionsTab = props => {
  const { isHidden, isDisabled, overflowMenu } = props

  overflowMenu.menu.includeShare = true
  overflowMenu.menu.includeRepost = true

  return (
    <div className={cn({ [styles.hide]: isHidden })}>
      {isDisabled || isHidden ? (
        <div className={styles.iconContainer}>
          <IconKebabHorizontal className={cn(styles.iconKebabHorizontal)} />
        </div>
      ) : (
        <Menu {...overflowMenu}>
          <div className={styles.iconContainer}>
            <IconKebabHorizontal className={cn(styles.iconKebabHorizontal)} />
          </div>
        </Menu>
      )}
    </div>
  )
}

const ExpandedActionsTab = props => {
  const {
    isHidden,
    isDisabled,
    direction,
    currentUserReposted,
    isOwner,
    onToggleRepost,
    onShare,
    overflowMenu
  } = props

  overflowMenu.menu.includeShare = false
  overflowMenu.menu.includeRepost = false

  return (
    <>
      <Tooltip
        text={currentUserReposted ? 'Unrepost' : 'Repost'}
        disabled={isHidden || isDisabled || isOwner}
        placement={direction === 'horizontal' ? 'bottom' : 'right'}
      >
        <div
          className={cn(styles.actionButton, {
            [styles.disabled]: isOwner
          })}
          onClick={isDisabled || isOwner ? () => {} : onToggleRepost}
        >
          <Toast
            text={'Reposted!'}
            disabled={currentUserReposted || isHidden || isDisabled || isOwner}
            delay={REPOST_TOAST_TIMEOUT_MILLIS}
            containerClassName={styles.actionIconContainer}
            placement={direction === 'horizontal' ? 'bottom' : 'right'}
          >
            <IconRepost
              className={cn(styles.iconRepost, {
                [styles.reposted]: currentUserReposted
              })}
            />
          </Toast>
        </div>
      </Tooltip>
      <Tooltip
        text='Share'
        disabled={isHidden || isDisabled}
        placement={direction === 'horizontal' ? 'bottom' : 'right'}
      >
        <div
          className={styles.actionButton}
          onClick={isDisabled ? () => {} : onShare}
        >
          <Toast
            text={'Copied To Clipboard!'}
            disabled={isHidden || isDisabled || isShareToastDisabled}
            requireAccount={false}
            delay={SHARE_TOAST_TIMEOUT_MILLIS}
            containerClassName={styles.actionIconContainer}
            placement={direction === 'horizontal' ? 'bottom' : 'right'}
          >
            <IconShare className={styles.iconShare} />
          </Toast>
        </div>
      </Tooltip>
      <div className={styles.actionButton}>
        {isDisabled || isHidden ? (
          <div className={styles.iconKebabHorizontalWrapper}>
            <IconKebabHorizontal className={styles.iconKebabHorizontal} />
          </div>
        ) : (
          <Menu {...overflowMenu}>
            <div className={styles.iconKebabHorizontalWrapper}>
              <IconKebabHorizontal className={styles.iconKebabHorizontal} />
            </div>
          </Menu>
        )}
      </div>
    </>
  )
}

export class ActionsTab extends PureComponent {
  onToggleRepost = () => {
    const {
      repostTrack,
      undoRepostTrack,
      repostCollection,
      undoRepostCollection,
      currentUserReposted,
      variant,
      trackId,
      playlistId
    } = this.props
    if (variant === 'track') {
      currentUserReposted ? undoRepostTrack(trackId) : repostTrack(trackId)
    } else if (variant === 'playlist' || variant === 'album') {
      currentUserReposted
        ? undoRepostCollection(playlistId)
        : repostCollection(playlistId)
    }
  }

  onShare = () => {
    const {
      trackId,
      variant,
      playlistId,
      shareTrack,
      shareCollection
    } = this.props
    if (variant === 'track') {
      shareTrack(trackId)
    } else if (variant === 'playlist' || variant === 'album') {
      shareCollection(playlistId)
    }
  }

  render() {
    const {
      minimized,
      standalone,
      isHidden,
      isDisabled,
      direction,
      variant,
      containerStyles,
      handle,
      userHandle,
      playlistId,
      playlistName,
      trackId,
      trackTitle,
      currentUserSaved,
      currentUserReposted,
      isArtistPick,
      isPublic,
      includeEdit
    } = this.props

    const overflowMenu = {
      menu: {
        handle: handle,
        isFavorited: currentUserSaved,
        isReposted: currentUserReposted,
        mount: 'page',
        isOwner: handle === userHandle,
        isArtistPick: isArtistPick
      }
    }
    if (variant === 'track') {
      overflowMenu.menu.type = 'track'
      overflowMenu.menu.trackId = trackId
      overflowMenu.menu.trackTitle = trackTitle
      overflowMenu.menu.isArtistPick = isArtistPick
    } else if (variant === 'playlist' || variant === 'album') {
      overflowMenu.menu.type = variant === 'playlist' ? 'playlist' : 'album'
      overflowMenu.menu.playlistId = playlistId
      overflowMenu.menu.playlistName = playlistName
      overflowMenu.menu.includeAddToPlaylist = false
      overflowMenu.menu.isPublic = isPublic
      overflowMenu.menu.includeEdit = includeEdit
    }

    return (
      <div
        className={cn(styles.actionsSection, {
          [styles.show]: !isHidden,
          [styles.hide]: isHidden,
          [styles.horizontal]: direction === 'horizontal',
          [styles.vertical]: direction === 'vertical',
          [styles.disabled]: isDisabled,
          [styles.standalone]: standalone,
          [containerStyles]: !!containerStyles
        })}
      >
        {minimized ? (
          <MinimizedActionsTab {...this.props} overflowMenu={overflowMenu} />
        ) : (
          <ExpandedActionsTab
            {...this.props}
            isOwner={handle === userHandle}
            overflowMenu={overflowMenu}
            onToggleRepost={this.onToggleRepost}
            onShare={this.onShare}
          />
        )}
      </div>
    )
  }
}

ActionsTab.propTypes = {
  isHidden: PropTypes.bool,
  minimized: PropTypes.bool,
  standalone: PropTypes.bool,
  isDisabled: PropTypes.bool,
  includeEdit: PropTypes.bool,
  direction: PropTypes.oneOf(['vertical', 'horizontal']),
  variant: PropTypes.oneOf(['track', 'playlist', 'album']),
  containerStyles: PropTypes.string,
  handle: PropTypes.string,
  trackTitle: PropTypes.string,
  trackId: PropTypes.number,
  playlistName: PropTypes.string,
  playlistId: PropTypes.number
}

ActionsTab.defaultProps = {
  isHidden: false,
  minimized: false,
  standalone: false,
  isDisabled: false,
  direction: 'vertical',
  variant: 'track',
  handle: 'handle'
}

const mapStateToProps = state => ({
  userHandle: getUserHandle(state)
})

const mapDispatchToProps = dispatch => ({
  shareTrack: trackId => dispatch(shareTrack(trackId, ShareSource.TILE)),
  shareCollection: collectionId =>
    dispatch(shareCollection(collectionId, ShareSource.TILE)),
  repostTrack: trackId => dispatch(repostTrack(trackId, RepostSource.TILE)),
  undoRepostTrack: trackId =>
    dispatch(undoRepostTrack(trackId, RepostSource.TILE)),
  repostCollection: playlistId =>
    dispatch(repostCollection(playlistId, RepostSource.TILE)),
  undoRepostCollection: playlistId =>
    dispatch(undoRepostCollection(playlistId, RepostSource.TILE))
})

export default connect(mapStateToProps, mapDispatchToProps)(ActionsTab)
