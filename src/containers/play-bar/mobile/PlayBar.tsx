import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import cn from 'classnames'

import { PlayButtonStatus } from 'components/play-bar/types'
import { pause, play } from 'store/queue/slice'
import {
  recordListen,
  saveTrack,
  unsaveTrack
} from 'store/social/tracks/actions'
import { AppState } from 'store/types'

import PlayButton from 'components/play-bar/PlayButton'
import {
  getAudio,
  getBuffering,
  getCounter,
  getPlaying
} from 'store/player/selectors'
import { makeGetCurrent } from 'store/queue/selectors'

import styles from './PlayBar.module.css'

import CoSign, { Size } from 'components/co-sign/CoSign'
import TrackingBar from 'components/play-bar/TrackingBar'
import { ID } from 'models/common/Identifiers'
import { isDarkMode } from 'utils/theme/theme'
import FavoriteButton from 'components/general/alt-button/FavoriteButton'
import { FavoriteSource, Name, PlaybackSource } from 'services/analytics'
import { make, useRecord } from 'store/analytics/actions'
import { useTrackCoverArt } from 'hooks/useImageSize'
import { SquareSizes } from 'models/common/ImageSizes'
import { AudioState } from 'store/player/types'

const SEEK_INTERVAL = 200

type OwnProps = {
  audio: AudioState
  onClickInfo: () => void
}

type PlayBarProps = OwnProps &
  ReturnType<ReturnType<typeof makeMapStateToProps>> &
  ReturnType<typeof mapDispatchToProps>

const PlayBar = ({
  currentQueueItem,
  audio,
  isPlaying,
  isBuffering,
  play,
  pause,
  save,
  unsave,
  onClickInfo
}: PlayBarProps) => {
  const { uid, track, user } = currentQueueItem

  const [percentComplete, setPercentComplete] = useState(0)
  const record = useRecord()

  useEffect(() => {
    const seekInterval = setInterval(async () => {
      const duration = await audio?.getDuration()
      const pos = await audio?.getPosition()
      if (duration === undefined || pos === undefined) return

      const position = Math.min(pos, duration)
      const percent = (position / duration) * 100
      if (percent) setPercentComplete(percent)
    }, SEEK_INTERVAL)
    return () => clearInterval(seekInterval)
  })

  const image = useTrackCoverArt(
    track ? track.track_id : null,
    track ? track._cover_art_sizes : null,
    SquareSizes.SIZE_150_BY_150
  )

  if (!audio || !uid || !track || !user) return null

  const { title, track_id, has_current_user_saved, _co_sign } = track
  const { name } = user

  let playButtonStatus
  if (isBuffering) {
    playButtonStatus = PlayButtonStatus.LOAD
  } else if (isPlaying) {
    playButtonStatus = PlayButtonStatus.PAUSE
  } else {
    playButtonStatus = PlayButtonStatus.PLAY
  }

  const togglePlay = () => {
    if (isPlaying) {
      pause()
      record(
        make(Name.PLAYBACK_PAUSE, {
          id: `${track_id}`,
          source: PlaybackSource.PLAYBAR
        })
      )
    } else {
      play()
      record(
        make(Name.PLAYBACK_PLAY, {
          id: `${track_id}`,
          source: PlaybackSource.PLAYBAR
        })
      )
    }
  }

  const toggleFavorite = () => {
    if (track_id) {
      has_current_user_saved ? unsave(track_id) : save(track_id)
    }
  }

  return (
    <>
      <div className={styles.playBar}>
        <TrackingBar percentComplete={percentComplete} />
        <div className={styles.controls}>
          <FavoriteButton
            onClick={toggleFavorite}
            isDarkMode={isDarkMode()}
            isActive={has_current_user_saved}
            className={styles.favorite}
          />
          <div className={styles.info} onClick={onClickInfo}>
            {_co_sign ? (
              <CoSign
                className={styles.artwork}
                size={Size.TINY}
                hasFavorited={_co_sign.has_remix_author_saved}
                hasReposted={_co_sign.has_remix_author_reposted}
                coSignName={_co_sign.user.name}
                userId={_co_sign.user.user_id}
              >
                <div
                  className={styles.image}
                  style={{
                    backgroundImage: `url(${image})`
                  }}
                />
              </CoSign>
            ) : (
              <div
                className={cn(styles.artwork, styles.image)}
                style={{
                  backgroundImage: `url(${image})`
                }}
              />
            )}
            <div className={styles.title}>{title}</div>
            <div className={styles.separator}>•</div>
            <div className={styles.artist}>{name}</div>
          </div>
          <div className={styles.play}>
            <PlayButton
              playable
              status={playButtonStatus}
              onClick={togglePlay}
            />
          </div>
        </div>
      </div>
    </>
  )
}

function makeMapStateToProps() {
  const getCurrentQueueItem = makeGetCurrent()

  const mapStateToProps = (state: AppState) => ({
    currentQueueItem: getCurrentQueueItem(state),
    playCounter: getCounter(state),
    audio: getAudio(state),
    isPlaying: getPlaying(state),
    isBuffering: getBuffering(state)
  })
  return mapStateToProps
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    play: () => {
      dispatch(play({}))
    },
    pause: () => {
      dispatch(pause({}))
    },
    save: (trackId: ID) => dispatch(saveTrack(trackId, FavoriteSource.PLAYBAR)),
    unsave: (trackId: ID) =>
      dispatch(unsaveTrack(trackId, FavoriteSource.PLAYBAR)),
    recordListen: (trackId: ID) => dispatch(recordListen(trackId))
  }
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PlayBar)
