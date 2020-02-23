import { h } from 'preact'
import { useState, useContext } from 'preact/hooks'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'
import { GetCollectionsResponse } from '../../util/BedtimeClient'
import Artwork from '../artwork/Artwork'
import AudiusLogoButton from '../button/AudiusLogoButton'
import ShareButton from '../button/ShareButton'
import { Flavor } from '../pausedpopover/PausePopover'
import PlayButton, { PlayingState } from '../playbutton/PlayButton'
import BedtimeScrubber from '../scrubber/BedtimeScrubber'
import Titles from '../titles/Titles'

import styles from './CollectionPlayerCard.module.css'
import Card from '../card/Card'

// TODO:
// interface CollectionPlayerListRowProps {
//   playingState: PlayingState
//   trackTitle: string
//   artistName: string
//   trackURL: string
//   artistHandle: string
//   trackIndex: number
//   isActive: boolean
//   onTogglePlay: () => void
//   iconColor: string
//   onAfterPause: () => void
// }

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
  onAfterPause
}) => {
  const makeOnClickURL = (url) => () => {
    window.open(url, '_blank')
  }

  return (
    <div
      className={styles.trackListRow}
      onClick={(e) => {
        e.stopPropagation()
        onTogglePlay()
        if (isActive && playingState === PlayingState.Playing) { onAfterPause() }
      }}
      style={isActive && playingState !== PlayingState.Stopped? { backgroundColor: 'rgba(0, 0, 0, 0.04)' } : {}}
    >
      <div className={styles.backgroundElement}/>
      <div className={styles.leftElement}>
        {isActive ?
         <PlayButton
           onTogglePlay={onTogglePlay}
           playingState={playingState}
           iconColor={iconColor}
           className={styles.playButton}
           onAfterPause={onAfterPause}
         /> :
         trackIndex
        }
      </div>
      <div className={styles.rightElement}>
        <div
          className={styles.rowTitle}
          onClick={makeOnClickURL(trackURL)}
        >
          {trackTitle}
        </div>
        <div
          className={styles.rowSubtitle}
          onClick={makeOnClickURL(artistHandle)}
        >
          {artistName}
        </div>
      </div>
    </div>
  )
}

// TODO: Add proptypes
// interface CollectionPlayerCardProps {
//   collection: GetCollectionsResponse
//   seekTo: (location: number) => void
//   onTogglePlay: (trackIndex: number) => void
//   duration: number
//   elapsedSeconds: number
//   mediaKey: string
//   playingState: PlayingState
//   backgroundColor: string
//   rowBackgroundColor: string
//   activeTrackIndex: number
// }

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
  onAfterPause,
  isTwitter
}) => {

  const makeOnTogglePlay = (index) => () => onTogglePlay(index)

  return (
    <Card
      isTwitter={isTwitter}
      backgroundColor={backgroundColor}
      twitterURL={collection.collectionURLPath}
    >
      <div className={styles.padding}>
        <div className={styles.topRow}>
          <div className={styles.logo}>
            <AudiusLogoButton />
          </div>
          <div className={styles.share}>
            <ShareButton
              url={collection.collectionURLPath}
              creator={collection.ownerName}
              title={collection.name}
            />
          </div>
        </div>
        <div className={styles.middleRow}>
          <Artwork
            className={styles.artwork}
            artworkURL={collection.coverArt}
            onClickURL={collection.collectionURLPath}
            displayHoverPlayButton={true}
            onAfterPause={onAfterPause}
            onTogglePlay={makeOnTogglePlay(activeTrackIndex)}
            playingState={playingState}
            iconColor={rowBackgroundColor}
          />
          <div className={styles.middleRowRight}>
            <Titles
              artistName={collection.ownerName}
              handle={collection.ownerHandle}
              isVerified={false}
              title={collection.name}
              titleUrl={collection.collectionURLPath}
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
        <div
          className={styles.listContainer}
        >
          <SimpleBar
            style={{
              maxHeight: '100%'
            }}
          >
            {collection.tracks.map((t, i) => {
              return (
                <CollectionListRow
                  key={i}
                  artistHandle={t.handle}
                  artistName={t.userName}
                  isActive={i === activeTrackIndex}
                  playingState={playingState}
                  trackIndex={i + 1}
                  trackURL={t.urlPath}
                  trackTitle={t.title}
                  iconColor={rowBackgroundColor}
                  onTogglePlay={makeOnTogglePlay(i)}
                  onAfterPause={onAfterPause}
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

