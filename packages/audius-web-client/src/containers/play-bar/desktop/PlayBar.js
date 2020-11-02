import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push as pushRoute } from 'connected-react-router'
import { trackPage, profilePage } from 'utils/route'
import { Scrubber } from '@audius/stems'

import { RepeatMode } from 'store/queue/types'

import {
  repostTrack,
  undoRepostTrack,
  saveTrack,
  unsaveTrack
} from 'store/social/tracks/actions'
import { seek, reset } from 'store/player/slice'
import { play, pause, next, previous, repeat, shuffle } from 'store/queue/slice'

import {
  getAudio,
  getPlaying,
  getCounter,
  getUid as getPlayingUid
} from 'store/player/selectors'
import { makeGetCurrent } from 'store/queue/selectors'
import { getLineupSelectorForRoute } from 'store/lineup/lineupForRoute'
import { getLineupHasTracks } from 'store/lineup/selectors'
import { getUserId } from 'store/account/selectors'
import { getTheme } from 'store/application/ui/theme/selectors'

import PlayingTrackInfo from './components/PlayingTrackInfo'
import VolumeBar from 'components/play-bar/VolumeBar'
import PlayButton from 'components/play-bar/PlayButton'
import NextButton from 'components/play-bar/NextButton'
import PreviousButton from 'components/play-bar/PreviousButton'
import ShuffleButtonProvider from 'components/play-bar/shuffle-button/ShuffleButtonProvider'
import RepeatButtonProvider from 'components/play-bar/repeat-button/RepeatButtonProvider'
import RepostButton from 'components/general/RepostButton'
import FavoriteButton from 'components/general/FavoriteButton'
import Tooltip from 'components/tooltip/Tooltip'

import styles from './PlayBar.module.css'

import { setupHotkeys } from 'utils/hotkeyUtil'
import { shouldShowDark } from 'utils/theme/theme'
import {
  RepostSource,
  FavoriteSource,
  Name,
  PlaybackSource
} from 'services/analytics'
import { make } from 'store/analytics/actions'

const VOLUME_GRANULARITY = 100.0
const SEEK_INTERVAL = 200
const RESTART_THRESHOLD_SEC = 3

class PlayBar extends Component {
  constructor(props) {
    super(props)

    // State used to manage time on left of playbar.
    this.state = {
      seeking: false,
      trackPosition: 0,
      playCounter: null,
      trackId: null,
      // Capture intent to set initial volume before audio is playing
      initialVolume: null
    }
    this.seekInterval = null
  }

  componentDidMount() {
    setupHotkeys(
      {
        32 /* space */: this.togglePlay,
        37 /* left arrow */: this.onPrevious,
        39 /* right arrow */: this.props.next
      },
      /* throttle= */ 200
    )
  }

  componentDidUpdate(prevProps) {
    const { audio, playing, playCounter } = this.props
    if (!playing) {
      clearInterval(this.seekInterval)
      this.seekInterval = null
    }

    if (playing && !this.seekInterval) {
      this.seekInterval = setInterval(() => {
        const trackPosition = audio.getPosition()
        this.setState({ trackPosition })
      }, SEEK_INTERVAL)
    }

    if (playCounter !== this.state.playCounter) {
      this.setState({
        playCounter: playCounter,
        trackPosition: 0,
        listenRecorded: false
      })
    }

    // If there was an intent to set initial volume and audio is defined
    // set the initial volume
    if (this.state.initialVolume && audio) {
      audio.setVolume(this.state.initialVolume)
      this.setState({
        initialVolume: null
      })
    }
  }

  componentWillUnmount() {
    clearInterval(this.seekInterval)
  }

  goToTrackPage = () => {
    const {
      currentQueueItem: { track, user },
      goToRoute
    } = this.props

    if (track && user) {
      const handle = user.handle
      const title = track.title
      const id = track.track_id
      goToRoute(trackPage(handle, title, id))
    }
  }

  goToArtistPage = () => {
    const {
      currentQueueItem: { user },
      goToRoute
    } = this.props

    if (user) {
      const handle = user.handle
      goToRoute(profilePage(handle))
    }
  }

  togglePlay = () => {
    const {
      currentQueueItem: { track },
      audio,
      playing,
      play,
      pause,
      record
    } = this.props

    if (audio && playing) {
      pause()
      record(
        make(Name.PLAYBACK_PAUSE, {
          id: track.track_id,
          source: PlaybackSource.PLAYBAR
        })
      )
    } else if (this.playable()) {
      play()
      record(
        make(Name.PLAYBACK_PLAY, {
          id: track ? track.track_id : null,
          source: PlaybackSource.PLAYBAR
        })
      )
    }
  }

  onToggleFavorite = (favorited, trackId) => {
    if (trackId) {
      favorited
        ? this.props.unsaveTrack(trackId)
        : this.props.saveTrack(trackId)
    }
  }

  onToggleRepost = (reposted, trackId) => {
    if (trackId) {
      reposted
        ? this.props.undoRepostTrack(trackId)
        : this.props.repostTrack(trackId)
    }
  }

  updateVolume = volume => {
    const { audio } = this.props
    if (audio) {
      // If we already have an audio object set the volume immediately!
      audio.setVolume(volume / VOLUME_GRANULARITY)
    } else {
      // Store volume in the state so that when audio does mount we can set it
      this.setState({
        initialVolume: volume / VOLUME_GRANULARITY
      })
    }
  }

  repeatAll = () => {
    this.props.repeat(RepeatMode.ALL)
  }

  repeatSingle = () => {
    this.props.repeat(RepeatMode.SINGLE)
  }

  repeatOff = () => {
    this.props.repeat(RepeatMode.OFF)
  }

  shuffleOn = () => {
    this.props.shuffle(true)
  }

  shuffleOff = () => {
    this.props.shuffle(false)
  }

  onPrevious = () => {
    const shouldGoToPrevious = this.state.trackPosition < RESTART_THRESHOLD_SEC
    if (shouldGoToPrevious) {
      this.props.previous()
    } else {
      this.props.reset(true /* shouldAutoplay */)
    }
  }

  playable = () =>
    !!this.props.currentQueueItem.uid || this.props.lineupHasTracks

  render() {
    const {
      currentQueueItem: { uid, track, user },
      playCounter,
      audio,
      playing,
      userId,
      theme
    } = this.props

    let trackTitle = ''
    let artistName = ''
    let artistHandle = ''
    let artistUserId = null
    let isVerified = false
    let profilePictureSizes = null
    let trackId = null
    let duration = null
    let reposted = false
    let favorited = false
    let isOwner = false

    if (uid && track && user) {
      trackTitle = track.title
      artistName = user.name
      artistHandle = user.handle
      artistUserId = user.user_id
      isVerified = user.is_verified
      profilePictureSizes = user._profile_picture_sizes
      isOwner = track.owner_id === userId

      duration = audio.getDuration()
      trackId = track.track_id
      reposted = track.has_current_user_reposted
      favorited = track.has_current_user_saved || false
    }

    let playButtonStatus
    if (audio?.isBuffering()) {
      playButtonStatus = 'load'
    } else if (playing) {
      playButtonStatus = 'pause'
    } else {
      playButtonStatus = 'play'
    }

    return (
      <div className={styles.playBar}>
        <div className={styles.playBarContentWrapper}>
          <div className={styles.playBarPlayingInfo}>
            <PlayingTrackInfo
              profilePictureSizes={profilePictureSizes}
              trackId={trackId}
              isOwner={isOwner}
              trackTitle={trackTitle}
              artistName={artistName}
              artistHandle={artistHandle}
              artistUserId={artistUserId}
              isVerified={isVerified}
              onClickTrackTitle={this.goToTrackPage}
              onClickArtistName={this.goToArtistPage}
            />
          </div>

          <div className={styles.playBarControls}>
            <div className={styles.timeControls}>
              <Scrubber
                mediaKey={`${uid}${playCounter}`}
                isPlaying={playing && !audio?.isBuffering()}
                isDisabled={!uid}
                includeTimestamps
                elapsedSeconds={audio?.getPosition()}
                totalSeconds={duration}
                style={{
                  handleColor: 'var(--static-white)'
                }}
                onScrubRelease={this.props.seek}
              />
            </div>

            <div className={styles.buttonControls}>
              <div className={styles.shuffleButton}>
                <ShuffleButtonProvider
                  darkMode={shouldShowDark(theme)}
                  onShuffleOn={this.shuffleOn}
                  onShuffleOff={this.shuffleOff}
                />
              </div>
              <div className={styles.previousButton}>
                <PreviousButton onClick={this.onPrevious} />
              </div>
              <div className={styles.playButton}>
                <PlayButton
                  playable={this.playable()}
                  status={playButtonStatus}
                  onClick={this.togglePlay}
                />
              </div>
              <div className={styles.nextButton}>
                <NextButton onClick={this.props.next} />
              </div>
              <div className={styles.repeatButton}>
                <RepeatButtonProvider
                  darkMode={shouldShowDark(theme)}
                  onRepeatOff={this.repeatOff}
                  onRepeatAll={this.repeatAll}
                  onRepeatSingle={this.repeatSingle}
                />
              </div>
            </div>
          </div>

          <div className={styles.optionsRight}>
            <div className={styles.toggleFavoriteContainer}>
              <Tooltip
                text={favorited ? 'Unfavorite' : 'Favorite'}
                mount='parent'
              >
                <span>
                  <FavoriteButton
                    favoritedClassName={styles.favorited}
                    disabled={!uid || isOwner}
                    unfavoritedClassName={styles.unfavorited}
                    favorited={favorited}
                    onClick={() => this.onToggleFavorite(favorited, trackId)}
                  />
                </span>
              </Tooltip>
            </div>
            <VolumeBar
              defaultValue={100}
              granularity={VOLUME_GRANULARITY}
              onChange={this.updateVolume}
            />
            <RepostButton
              // Disable repost button if not track is playing or for your own tracks
              disabled={!uid || isOwner}
              reposted={reposted}
              onClick={() => this.onToggleRepost(reposted, trackId)}
              className={styles.repostButton}
            />
          </div>
        </div>
      </div>
    )
  }
}

const makeMapStateToProps = () => {
  const getCurrentQueueItem = makeGetCurrent()

  const mapStateToProps = (state, props) => ({
    currentQueueItem: getCurrentQueueItem(state),
    playCounter: getCounter(state),
    audio: getAudio(state),
    playing: getPlaying(state),
    playingUid: getPlayingUid(state),
    lineupHasTracks: getLineupHasTracks(
      getLineupSelectorForRoute(state),
      state
    ),
    userId: getUserId(state),
    theme: getTheme(state)
  })
  return mapStateToProps
}

const mapDispatchToProps = dispatch => ({
  play: () => {
    dispatch(play({}))
  },
  pause: () => {
    dispatch(pause({}))
  },
  next: () => {
    dispatch(next({ skip: true }))
  },
  previous: () => {
    dispatch(previous({}))
  },
  reset: shouldAutoplay => {
    dispatch(reset({ shouldAutoplay }))
  },
  seek: position => {
    dispatch(seek({ seconds: position }))
  },
  repeat: mode => {
    dispatch(repeat({ mode }))
  },
  shuffle: enable => {
    dispatch(shuffle({ enable }))
  },
  repostTrack: trackId => dispatch(repostTrack(trackId, RepostSource.PLAYBAR)),
  undoRepostTrack: trackId =>
    dispatch(undoRepostTrack(trackId, RepostSource.PLAYBAR)),
  saveTrack: trackId => dispatch(saveTrack(trackId, FavoriteSource.PLAYBAR)),
  unsaveTrack: trackId =>
    dispatch(unsaveTrack(trackId, FavoriteSource.PLAYBAR)),
  goToRoute: route => dispatch(pushRoute(route)),
  record: event => dispatch(event)
})

export default connect(makeMapStateToProps, mapDispatchToProps)(PlayBar)
