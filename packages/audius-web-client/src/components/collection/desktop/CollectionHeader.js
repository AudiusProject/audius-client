import React, { PureComponent, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import Linkify from 'linkifyjs/react'
import Input from 'antd/lib/input'
import Spin from 'antd/lib/spin'
import {
  Button,
  ButtonType,
  IconPause,
  IconPlay,
  IconRepost,
  IconHeart,
  IconKebabHorizontal,
  IconShare,
  IconPencil,
  IconRocket
} from '@audius/stems'

import { formatSecondsAsText, formatDate } from 'utils/timeUtil'

import InfoLabel from 'components/track/InfoLabel'
import ArtistPopover from 'components/artist/ArtistPopover'
import Toast from 'components/toast/Toast'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import Skeleton from 'components/general/Skeleton'

import { ReactComponent as IconFilter } from 'assets/img/iconFilter.svg'
import styles from './CollectionHeader.module.css'
import Tooltip from 'components/tooltip/Tooltip'
import { useCollectionCoverArt } from 'hooks/useImageSize'
import { SquareSizes } from 'models/common/ImageSizes'
import { squashNewLines } from 'utils/formatUtil'
import Menu from 'containers/menu/Menu'
import RepostFavoritesStats from 'components/repost-favorites-stats/RepostFavoritesStats'
import { ReactComponent as IconVerified } from 'assets/img/iconVerified.svg'
import { Variant } from 'models/Collection'

const BUTTON_COLLAPSE_WIDTHS = {
  first: 1148,
  second: 1184,
  third: 1274,
  fourth: 1374
}

// Toast timeouts in ms
const REPOST_TIMEOUT = 1000
const SHARE_TIMEOUT = 1500

const messages = {
  copied: 'Copied To Clipboard!',
  shareButton: 'SHARE',
  repostButton: 'REPOST',
  repostButtonReposted: 'REPOSTED',
  favoriteButton: 'FAVORITE',
  favoriteButtonFavorited: 'FAVORITED',
  editButton: 'EDIT',
  publishButton: 'MAKE PUBLIC',
  publishingButton: 'PUBLISHING',
  reposted: 'Reposted!',
  repost: 'Repost',
  unrepost: 'Unrepost',
  favorite: 'Favorite',
  unfavorite: 'Unfavorite',
  playlistViewable: 'Your playlist can now be viewed by others!',
  filter: 'Filter Tracks'
}

const PlayButton = props => {
  return props.playing ? (
    <Button
      className={cn(
        styles.playAllButton,
        styles.buttonSpacing,
        styles.buttonFormatting
      )}
      textClassName={styles.buttonTextFormatting}
      type={ButtonType.PRIMARY_ALT}
      text='PAUSE'
      leftIcon={<IconPause />}
      onClick={props.onPlay}
      widthToHideText={BUTTON_COLLAPSE_WIDTHS.first}
      minWidth={132}
    />
  ) : (
    <Button
      className={cn(styles.playAllButton, styles.buttonSpacing)}
      textClassName={styles.buttonTextFormatting}
      type={ButtonType.PRIMARY_ALT}
      text='PLAY'
      leftIcon={<IconPlay />}
      onClick={props.onPlay}
      widthToHideText={BUTTON_COLLAPSE_WIDTHS.first}
      minWidth={132}
    />
  )
}

const repostButtonText = isReposted =>
  isReposted ? messages.repostButtonReposted : messages.repostButton
const favoriteButtonText = isFavorited =>
  isFavorited ? messages.favoriteButtonFavorited : messages.favoriteButton

const ViewerHasTracksButtons = props => {
  return (
    <>
      <PlayButton playing={props.playing} onPlay={props.onPlay} />
      <Toast
        text={messages.copied}
        delay={SHARE_TIMEOUT}
        fillParent={false}
        requireAccount={false}
      >
        <Button
          className={cn(styles.buttonSpacing, styles.buttonFormatting)}
          textClassName={styles.buttonTextFormatting}
          type={ButtonType.COMMON}
          text={messages.shareButton}
          leftIcon={<IconShare />}
          onClick={props.onShare}
          widthToHideText={BUTTON_COLLAPSE_WIDTHS.second}
        />
      </Toast>
      <Toast
        text={messages.reposted}
        disabled={props.isReposted}
        delay={REPOST_TIMEOUT}
        fillParent={false}
      >
        <Tooltip
          disabled={props.isOwner || props.reposts === 0}
          text={props.isReposted ? messages.unrepost : messages.repost}
        >
          <div className={styles.buttonSpacing}>
            <Button
              type={props.isReposted ? ButtonType.SECONDARY : ButtonType.COMMON}
              className={styles.buttonFormatting}
              textClassName={styles.buttonTextFormatting}
              text={repostButtonText(props.isReposted)}
              leftIcon={<IconRepost />}
              onClick={props.onRepost}
              widthToHideText={BUTTON_COLLAPSE_WIDTHS.third}
            />
          </div>
        </Tooltip>
      </Toast>
      <Tooltip
        disabled={props.isOwner || props.saves === 0}
        text={props.isSaved ? messages.unfavorite : messages.favorite}
      >
        <div className={styles.buttonSpacing}>
          <Button
            type={props.isSaved ? ButtonType.SECONDARY : ButtonType.COMMON}
            className={styles.buttonFormatting}
            textClassName={styles.buttonTextFormatting}
            text={favoriteButtonText(props.isSaved)}
            leftIcon={<IconHeart />}
            onClick={props.onSave}
            widthToHideText={BUTTON_COLLAPSE_WIDTHS.fourth}
          />
        </div>
      </Tooltip>
      <span>
        <Menu {...props.overflowMenu}>
          <Button
            className={cn(styles.buttonSpacing, styles.buttonFormatting)}
            textClassName={styles.buttonTextFormatting}
            type={ButtonType.COMMON}
            text={null}
            leftIcon={<IconKebabHorizontal />}
          />
        </Menu>
      </span>
    </>
  )
}

const ViewerNoTracksButtons = props => {
  return (
    <>
      <Button
        className={cn(styles.buttonSpacing, styles.buttonFormatting)}
        textClassName={styles.buttonTextFormatting}
        type={ButtonType.DISABLED}
        text={messages.shareButton}
        leftIcon={<IconShare />}
        onClick={props.onShare}
        widthToHideText={BUTTON_COLLAPSE_WIDTHS.second}
      />
      <Button
        className={cn(styles.buttonSpacing, styles.buttonFormatting)}
        textClassName={styles.buttonTextFormatting}
        type={ButtonType.DISABLED}
        text={repostButtonText(props.isReposted)}
        leftIcon={<IconRepost />}
        onClick={props.onRepost}
        widthToHideText={BUTTON_COLLAPSE_WIDTHS.third}
      />
      <Button
        className={cn(styles.buttonSpacing, styles.buttonFormatting)}
        textClassName={styles.buttonTextFormatting}
        type={ButtonType.DISABLED}
        text={favoriteButtonText(props.isSaved)}
        leftIcon={<IconHeart />}
        onClick={props.onSave}
        widthToHideText={BUTTON_COLLAPSE_WIDTHS.fourth}
      />
      <span>
        <Menu {...props.overflowMenu}>
          <Button
            className={cn(styles.buttonSpacing, styles.buttonFormatting)}
            textClassName={styles.buttonTextFormatting}
            type={ButtonType.COMMON}
            text={null}
            leftIcon={<IconKebabHorizontal />}
            widthToHideText={1400}
          />
        </Menu>
      </span>
    </>
  )
}

const SmartCollectionButtons = props => {
  return (
    <>
      <PlayButton playing={props.playing} onPlay={props.onPlay} />
      <Tooltip
        disabled={props.isOwner || props.saves === 0}
        text={props.isSaved ? messages.unfavorite : messages.favorite}
      >
        <div className={styles.buttonSpacing}>
          <Button
            className={cn(styles.buttonSpacing, styles.buttonFormatting)}
            textClassName={styles.buttonTextFormatting}
            type={props.isSaved ? ButtonType.SECONDARY : ButtonType.COMMON}
            text={favoriteButtonText(props.isSaved)}
            leftIcon={<IconHeart />}
            onClick={props.onSave}
            widthToHideText={BUTTON_COLLAPSE_WIDTHS.second}
          />
        </div>
      </Tooltip>
    </>
  )
}

const OwnerNoTracksButtons = props => {
  return (
    <>
      <Button
        className={cn(styles.buttonSpacing, styles.buttonFormatting)}
        textClassName={styles.buttonTextFormatting}
        type={ButtonType.COMMON}
        text={messages.editButton}
        leftIcon={<IconPencil />}
        onClick={props.onEdit}
        widthToHideText={BUTTON_COLLAPSE_WIDTHS.second}
      />
    </>
  )
}

const OwnerNotPublishedButtons = props => {
  return (
    <>
      <PlayButton playing={props.playing} onPlay={props.onPlay} />
      {props.isAlbum ? null : (
        <Button
          className={cn(styles.buttonSpacing, styles.buttonFormatting)}
          textClassName={styles.buttonTextFormatting}
          type={props.isPublishing ? ButtonType.DISABLED : ButtonType.COMMON}
          text={
            props.isPublishing
              ? messages.publishingButton
              : messages.publishButton
          }
          leftIcon={
            props.isPublishing ? (
              <Spin className={styles.spinner} />
            ) : (
              <IconRocket />
            )
          }
          onClick={props.isPublishing ? () => {} : props.onPublish}
          widthToHideText={BUTTON_COLLAPSE_WIDTHS.second}
        />
      )}
      <Button
        className={cn(styles.buttonSpacing, styles.buttonFormatting)}
        textClassName={styles.buttonTextFormatting}
        type={ButtonType.COMMON}
        text={messages.editButton}
        leftIcon={<IconPencil />}
        onClick={props.onEdit}
        widthToHideText={BUTTON_COLLAPSE_WIDTHS.third}
      />
    </>
  )
}

const OwnerPublishedButtons = props => {
  const [showShareableToast, setShowShareableToast] = useState(false)

  const {
    isPublished,
    isPreviouslyUnpublished,
    unsetPreviouslyPublished
  } = props
  useEffect(() => {
    if (isPublished && isPreviouslyUnpublished) {
      setShowShareableToast(true)
      setTimeout(() => {
        setShowShareableToast(false)
        unsetPreviouslyPublished()
      }, 3000)
    }
  }, [isPreviouslyUnpublished, isPublished, unsetPreviouslyPublished])

  return (
    <>
      <PlayButton playing={props.playing} onPlay={props.onPlay} />
      <Toast
        text={messages.playlistViewable}
        fillParent={false}
        placement='top'
        firesOnClick={false}
        open={showShareableToast}
      >
        <Toast
          text={messages.copied}
          delay={SHARE_TIMEOUT}
          fillParent={false}
          requireAccount={false}
        >
          <Button
            className={cn(styles.buttonSpacing, styles.buttonFormatting)}
            textClassName={styles.buttonTextFormatting}
            type={ButtonType.COMMON}
            text={messages.shareButton}
            leftIcon={<IconShare />}
            onClick={props.onShare}
            widthToHideText={BUTTON_COLLAPSE_WIDTHS.second}
          />
        </Toast>
      </Toast>
      <Button
        className={cn(styles.buttonSpacing, styles.buttonFormatting)}
        textClassName={styles.buttonTextFormatting}
        type={ButtonType.COMMON}
        text={messages.editButton}
        leftIcon={<IconPencil />}
        onClick={props.onEdit}
        widthToHideText={BUTTON_COLLAPSE_WIDTHS.third}
      />
      <span>
        <Menu {...props.overflowMenu}>
          <Button
            className={cn(styles.buttonSpacing, styles.buttonFormatting)}
            textClassName={styles.buttonTextFormatting}
            type={ButtonType.COMMON}
            text={null}
            leftIcon={<IconKebabHorizontal />}
          />
        </Menu>
      </span>
    </>
  )
}

const Buttons = props => {
  const overflowMenuExtraItems = []
  if (!props.isOwner) {
    overflowMenuExtraItems.push({
      text: props.isFollowing ? 'Unfollow User' : 'Follow User',
      onClick: () =>
        setTimeout(
          () => (props.isFollowing ? props.onUnfollow() : props.onFollow()),
          0
        )
    })
  }

  const overflowMenu = {
    menu: {
      type: props.type,
      playlistId: props.playlistId,
      playlistName: props.playlistName,
      handle: props.ownerHandle,
      isFavorited: props.isSaved,
      mount: 'page',
      isOwner: props.isOwner,
      includeEmbed: true,
      includeSave: false,
      includeVisitPage: false,
      isPublic: props.isPublished,
      extraMenuItems: overflowMenuExtraItems
    }
  }

  const buttonProps = {
    ...props,
    overflowMenu
  }

  let buttons
  if (props.variant === Variant.SMART) {
    buttons = <SmartCollectionButtons {...buttonProps} />
  } else {
    if (props.isOwner) {
      if (props.hasTracks && props.isPublished) {
        buttons = <OwnerPublishedButtons {...buttonProps} />
      } else if (props.hasTracks && !props.isPublished) {
        buttons = <OwnerNotPublishedButtons {...buttonProps} />
      } else {
        buttons = <OwnerNoTracksButtons {...buttonProps} />
      }
    } else {
      if (props.hasTracks) {
        buttons = <ViewerHasTracksButtons {...buttonProps} />
      } else {
        buttons = <ViewerNoTracksButtons {...buttonProps} />
      }
    }
  }
  return buttons
}

const Artwork = ({
  collectionId,
  coverArtSizes,
  callback,
  gradient,
  icon: Icon
}) => {
  const image = useCollectionCoverArt(
    collectionId,
    coverArtSizes,
    SquareSizes.SIZE_1000_BY_1000
  )
  useEffect(() => {
    // If there's a gradient, this is a smart collection. Just immediately call back
    if (image || gradient) callback()
  }, [image, callback, gradient])

  return (
    <div className={styles.coverArtWrapper}>
      <DynamicImage className={styles.coverArt} image={gradient || image}>
        {Icon && (
          <Icon className={styles.imageIcon} style={{ background: gradient }} />
        )}
      </DynamicImage>
    </div>
  )
}

class CollectionHeader extends PureComponent {
  state = {
    filterText: '',
    // Stores state if the user publishes the playlist this "session"
    previouslyUnpublished: false,
    artworkLoading: true
  }

  unsetPreviouslyPublished = () => {
    this.setState({ previouslyUnpublished: false })
  }

  onFilterChange = e => {
    const newFilterText = e.target.value
    this.setState({
      filterText: newFilterText
    })
    this.props.onFilterChange(e)
  }

  onPublish = () => {
    this.setState({ previouslyUnpublished: true })
    this.props.onPublish()
  }

  onArtworkLoad = () => {
    this.setState({ artworkLoading: false })
  }

  renderStatsRow = isLoading => {
    if (isLoading) return null
    const { reposts, saves, onClickReposts, onClickFavorites } = this.props
    return (
      <RepostFavoritesStats
        isUnlisted={false}
        repostCount={reposts}
        saveCount={saves}
        onClickReposts={onClickReposts}
        onClickFavorites={onClickFavorites}
        className={styles.statsWrapper}
      />
    )
  }

  render() {
    const {
      collectionId,
      type,
      title,
      coverArtSizes,
      artistName,
      artistHandle,
      isVerified,
      description,
      isOwner,
      isAlbum,
      modified,
      numTracks,
      duration,
      isPublished,
      isPublishing,
      tracksLoading,
      loading,
      playing,
      isReposted,
      isSaved,
      isFollowing,
      reposts,
      saves,
      onClickArtistName,
      onClickDescriptionExternalLink,
      onPlay,
      onEdit,
      onShare,
      onSave,
      onRepost,
      onFollow,
      onUnfollow,
      variant,
      gradient,
      icon
    } = this.props
    const { artworkLoading } = this.state
    const isLoading = loading || artworkLoading

    const fadeIn = {
      [styles.show]: !isLoading,
      [styles.hide]: isLoading
    }

    return (
      <div className={styles.collectionHeader}>
        <div key={collectionId} className={styles.topSection}>
          <Artwork
            collectionId={collectionId}
            coverArtSizes={coverArtSizes}
            callback={this.onArtworkLoad}
            gradient={gradient}
            icon={icon}
          />
          <div className={styles.infoSection}>
            <div className={cn(styles.typeLabel, fadeIn)}>
              {type === 'playlist' && !isPublished ? 'private playlist' : type}
            </div>
            <div className={styles.title}>
              <h1 className={cn(fadeIn)}>{title}</h1>
              {isLoading && <Skeleton className={styles.skeleton} />}
            </div>
            {artistName && (
              <div className={styles.artistWrapper}>
                <div className={cn(fadeIn)}>
                  <span>By</span>
                  <ArtistPopover handle={artistHandle}>
                    <h2 className={styles.artist} onClick={onClickArtistName}>
                      {artistName}
                      {isVerified && (
                        <IconVerified className={styles.verified} />
                      )}
                    </h2>
                  </ArtistPopover>
                </div>
                {isLoading && (
                  <Skeleton className={styles.skeleton} width='60%' />
                )}
              </div>
            )}
            <div className={cn(styles.infoLabelsSection, fadeIn)}>
              {modified && (
                <InfoLabel
                  className={styles.infoLabelPlacement}
                  labelName='modified'
                  labelValue={formatDate(modified)}
                />
              )}
              <span className={styles.infoDuration}>
                {formatSecondsAsText(duration)}
              </span>
              <span className={styles.infoDuration}>{`${numTracks} Track${
                numTracks === 1 ? '' : 's'
              }`}</span>
            </div>
            <div className={cn(styles.description, fadeIn)}>
              <Linkify
                options={{
                  attributes: { onClick: onClickDescriptionExternalLink }
                }}
              >
                {squashNewLines(description)}
              </Linkify>
            </div>
            <div className={cn(styles.statsRow, fadeIn)}>
              {this.renderStatsRow(isLoading)}
            </div>
            <div
              className={cn(styles.buttonSection, {
                [styles.show]: !tracksLoading,
                [styles.hide]: tracksLoading
              })}
            >
              {!tracksLoading && (
                <Buttons
                  variant={variant}
                  playlistId={collectionId}
                  playlistName={title}
                  isOwner={isOwner}
                  type={type}
                  ownerHandle={artistHandle}
                  isAlbum={isAlbum}
                  hasTracks={numTracks > 0}
                  isPublished={isPublished}
                  isPreviouslyUnpublished={this.state.previouslyUnpublished}
                  unsetPreviouslyPublished={this.unsetPreviouslyPublished}
                  isPublishing={isPublishing}
                  playing={playing}
                  isReposted={isReposted}
                  isSaved={isSaved}
                  isFollowing={isFollowing}
                  reposts={reposts}
                  saves={saves}
                  shareClicked={this.shareClicked}
                  onPlay={onPlay}
                  onEdit={onEdit}
                  onPublish={this.onPublish}
                  onShare={onShare}
                  onSave={onSave}
                  onRepost={onRepost}
                  onFollow={onFollow}
                  onUnfollow={onUnfollow}
                />
              )}
            </div>
          </div>
          <div className={styles.inputWrapper}>
            <Input
              placeholder={messages.filter}
              prefix={<IconFilter />}
              onChange={this.onFilterChange}
              value={this.state.filterText}
            />
          </div>
        </div>
      </div>
    )
  }
}

CollectionHeader.propTypes = {
  collectionId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  index: PropTypes.number,
  loading: PropTypes.bool,
  tracksLoading: PropTypes.bool,
  playing: PropTypes.bool,
  active: PropTypes.bool,
  type: PropTypes.oneOf(['playlist', 'album']),
  title: PropTypes.string,
  artistName: PropTypes.string,
  artistHandle: PropTypes.string,
  coverArtSizes: PropTypes.object,
  tags: PropTypes.array,
  description: PropTypes.string,

  isOwner: PropTypes.bool,
  isVerified: PropTypes.bool,
  isAlbum: PropTypes.bool,
  hasTracks: PropTypes.bool,
  isPublished: PropTypes.bool,
  isPublishing: PropTypes.bool,
  isSaved: PropTypes.bool,
  reposts: PropTypes.number,
  saves: PropTypes.number,

  // Actions
  onClickArtistName: PropTypes.func,
  onFilterChange: PropTypes.func,
  onPlay: PropTypes.func,
  onEdit: PropTypes.func,
  onClickDescriptionExternalLink: PropTypes.func,

  // Smart collection
  variant: PropTypes.any, // CollectionVariant
  gradient: PropTypes.string,
  icon: PropTypes.any
}

CollectionHeader.defaultProps = {
  index: 0,
  loading: false,
  playing: false,
  active: true,
  type: 'playlist',
  tags: [],
  description: '',

  isOwner: false,
  isAlbum: false,
  hasTracks: false,
  isPublished: false,
  isPublishing: false,
  isSaved: false,

  reposts: 0,
  saves: 0,

  onFilterChange: () => {},
  onPlay: () => {},
  onEdit: () => {}
}

export default CollectionHeader
