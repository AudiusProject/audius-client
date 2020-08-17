import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'

import { ReactComponent as IconVerified } from 'assets/img/iconVerified.svg'
import { ReactComponent as IconVolume } from 'assets/img/iconVolume.svg'
import styles from './TrackInfo.module.css'
import ArtistPopover from 'components/artist/ArtistPopover'
import Skeleton from 'components/general/Skeleton'

class TrackInfo extends PureComponent {
  onClickTrackName = e => {
    e.stopPropagation()
    if (!this.props.disabled && this.props.onClickTrackName)
      this.props.onClickTrackName()
  }

  onClickArtistName = e => {
    e.stopPropagation()
    if (!this.props.disabled && this.props.onClickArtistName)
      this.props.onClickArtistName()
  }

  render() {
    const {
      contentTitle,
      isVerified,
      isLoading,
      trackTitle,
      active,
      artistName,
      disabled,
      artistHandle,
      size,
      onClickTrackName,
      onClickArtistName,
      popover,
      condense
    } = this.props

    const style = {
      [styles.extraLarge]: size === 'extraLarge',
      [styles.large]: size === 'large',
      [styles.medium]: size === 'medium',
      [styles.small]: size === 'small',
      [styles.tiny]: size === 'tiny',
      [styles.miniscule]: size === 'miniscule'
    }

    const trackTitleStyle = cn(styles.trackTitle, style, {
      [styles.active]: active,
      [styles.condense]: condense
    })
    const artistNameStyle = cn(styles.artistName, style, {
      [styles.active]: active,
      [styles.playlistCreator]: contentTitle === 'playlist'
    })

    const hideShow = cn({
      [styles.hide]: isLoading,
      [styles.show]: !isLoading
    })

    return (
      <div
        className={cn(styles.trackInfoWrapper, { [styles.disabled]: disabled })}
      >
        <div className={trackTitleStyle}>
          <div className={hideShow}>
            <div
              className={cn(styles.trackName, {
                [styles.trackNameLink]: onClickTrackName
              })}
              onClick={this.onClickTrackName}
            >
              {trackTitle}
            </div>
            {active ? (
              <span className={styles.volumeIcon}>
                <IconVolume />
              </span>
            ) : null}
          </div>
          {isLoading && <Skeleton width='80%' className={styles.skeleton} />}
        </div>
        <div className={artistNameStyle}>
          <div className={hideShow}>
            {contentTitle === 'playlist' ? (
              <span className={styles.createdBy}>{'Created by'}</span>
            ) : null}
            {popover ? (
              <ArtistPopover handle={artistHandle}>
                <span
                  className={cn({ [styles.artistNameLink]: onClickArtistName })}
                  onClick={this.onClickArtistName}
                >
                  {artistName}
                </span>
              </ArtistPopover>
            ) : (
              <span
                className={cn(styles.artistName, {
                  [styles.artistNameLink]: onClickArtistName
                })}
                onClick={this.onClickArtistName}
              >
                {artistName}
              </span>
            )}
            {isVerified && <IconVerified className={styles.iconVerified} />}
          </div>
          {isLoading && <Skeleton width='60%' className={styles.skeleton} />}
        </div>
      </div>
    )
  }
}

TrackInfo.propTypes = {
  trackTitle: PropTypes.string,
  artistName: PropTypes.string,
  artistHandle: PropTypes.string,
  isLoading: PropTypes.bool,
  condense: PropTypes.bool,
  size: PropTypes.oneOf([
    'extraLarge',
    'large',
    'medium',
    'small',
    'tiny',
    'miniscule'
  ]),
  isVerified: PropTypes.bool,
  active: PropTypes.bool,
  popover: PropTypes.bool,
  disabled: PropTypes.bool,
  onClickTrackName: PropTypes.func,
  onClickArtistName: PropTypes.func
}

TrackInfo.defaultProps = {
  trackTitle: '\u200B',
  artistName: '\u200B',
  artistHandle: '',
  size: 'medium',
  isVerified: false,
  active: false,
  disabled: false,
  condense: false,
  isLoading: false,
  routeArtistPage: false,
  routeTrackPage: false,
  popover: true
}

export default TrackInfo
