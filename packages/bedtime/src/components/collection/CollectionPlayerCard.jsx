import { h } from 'preact'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'
import Artwork from '../artwork/Artwork'
import AudiusLogoButton from '../button/AudiusLogoButton'
import ShareButton from '../button/ShareButton'
import PlayButton, { PlayingState } from '../playbutton/PlayButton'
import BedtimeScrubber from '../scrubber/BedtimeScrubber'
import Titles from '../titles/Titles'
import cn from 'classnames'
import Card from '../card/Card'
import { stripLeadingSlash } from '../../util/stringUtil'
import IconVerified from '../../assets/img/iconVerified.svg'

import styles from './CollectionPlayerCard.module.css'
import { isBItem } from '../../util/bitems'
import { getArtworkUrl } from '../../util/getArtworkUrl'

const CollectionListRow = ({
  playingState,
  trackTitle,
  artistName,
  trackURL,
  artistHandle,
  trackIndex,
  onTogglePlay,
  iconColor,
  isActive,
  textIsClickable,
  isVerified
}) => {
  const makeOnClickURL = (url) => () => {
    textIsClickable && window.open(url, '_blank')
  }

  const isPlaying = isActive && playingState !== PlayingState.Stopped

  return (
    <div
      className={cn(styles.trackListRow, { [styles.rowShaded]: isPlaying })}
      onClick={(e) => {
        e.stopPropagation()
        onTogglePlay()
      }}
    >
      <div
        className={cn(styles.leftElement, { [styles.trackIndex]: !isActive })}
      >
        {isActive ? (
          <PlayButton
            onTogglePlay={onTogglePlay}
            playingState={playingState}
            iconColor={iconColor}
            className={styles.playButton}
          />
        ) : (
          trackIndex
        )}
      </div>
      <div
        className={cn(styles.rightElement, {
          [styles.clickableText]: textIsClickable
        })}
      >
        <div className={styles.rowTitle} onClick={makeOnClickURL(trackURL)}>
          {trackTitle}
        </div>
        <div
          className={styles.rowSubtitle}
          onClick={makeOnClickURL(artistHandle)}
        >
          {artistName}
          {isVerified && <IconVerified />}
        </div>
      </div>
    </div>
  )
}

const CollectionPlayerCard = ({
  collection,
  seekTo,
  duration,
  elapsedSeconds,
  mediaKey,
  playingState,
  backgroundColor,
  rowBackgroundColor,
  activeTrackIndex,
  onTogglePlay,
  isTwitter
}) => {
  const makeOnTogglePlay = (index) => () => onTogglePlay(index)
  const permalink = stripLeadingSlash(collection.permalink)
  return (
    <Card
      isTwitter={isTwitter}
      backgroundColor={backgroundColor}
      twitterURL={permalink}
      fillContainer
    >
      <div className={styles.padding}>
        <div className={styles.topRow}>
          <div className={styles.logo}>
            <AudiusLogoButton />
          </div>
          <div className={styles.share}>
            <ShareButton
              url={permalink}
              creator={collection.user.name}
              title={collection.playlist_name}
            />
          </div>
        </div>
        <div className={styles.middleRow}>
          <Artwork
            className={styles.artwork}
            artworkURL={getArtworkUrl(collection)}
            onClickURL={permalink}
            displayHoverPlayButton
            onTogglePlay={makeOnTogglePlay(activeTrackIndex)}
            playingState={playingState}
            iconColor={rowBackgroundColor}
          />
          <div className={styles.middleRowRight}>
            <Titles
              artistName={collection.user.name}
              handle={collection.user.handle}
              isVerified={collection.user.is_verified}
              title={collection.playlist_name}
              titleUrl={permalink}
            />
            <BedtimeScrubber
              duration={duration}
              elapsedSeconds={elapsedSeconds}
              mediaKey={mediaKey}
              playingState={playingState}
              seekTo={seekTo}
            />
          </div>
        </div>
        <div className={styles.listContainer}>
          <SimpleBar
            style={{
              maxHeight: '100%'
            }}
          >
            {collection.tracks.map((track, i) => {
              if (isBItem(track.id)) return null
              return (
                <CollectionListRow
                  key={i}
                  artistHandle={track.user.handle}
                  artistName={track.user.name}
                  isActive={i === activeTrackIndex}
                  playingState={playingState}
                  trackIndex={i + 1}
                  trackURL={stripLeadingSlash(track.permalink)}
                  trackTitle={track.title}
                  iconColor={rowBackgroundColor}
                  onTogglePlay={makeOnTogglePlay(i)}
                  textIsClickable={false}
                  isVerified={track.user.is_verified}
                />
              )
            })}
          </SimpleBar>
        </div>
      </div>
    </Card>
  )
}

export default CollectionPlayerCard
