import React, { useCallback, useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import cn from 'classnames'
import {
  pushUniqueRoute as pushRoute,
  profilePage,
  trackPage
} from 'utils/route'
import { Dispatch } from 'redux'

import { Scrubber } from '@audius/stems'

import { PlayButtonStatus } from 'components/play-bar/types'
import { ID } from 'models/common/Identifiers'
import { seek, reset } from 'store/player/slice'
import {
  getAudio,
  getBuffering,
  getCounter,
  getPlaying
} from 'store/player/selectors'
import { next, pause, play, previous, repeat, shuffle } from 'store/queue/slice'
import { makeGetCurrent } from 'store/queue/selectors'
import { RepeatMode } from 'store/queue/types'
import {
  saveTrack,
  unsaveTrack,
  repostTrack,
  undoRepostTrack,
  shareTrack
} from 'store/social/tracks/actions'
import {
  OverflowAction,
  OverflowActionCallbacks,
  OverflowSource
} from 'store/application/ui/mobileOverflowModal/types'
import { open } from 'store/application/ui/mobileOverflowModal/actions'
import { AppState } from 'store/types'
import { getCastMethod } from 'containers/settings-page/store/selectors'

import NextButton from 'components/play-bar/NextButton'
import PlayButton from 'components/play-bar/PlayButton'
import PreviousButton from 'components/play-bar/PreviousButton'
import RepeatButtonProvider from 'components/play-bar/repeat-button/RepeatButtonProvider'
import { isDarkMode } from 'utils/theme/theme'

import { ReactComponent as IconVerified } from 'assets/img/iconVerified.svg'
import { ReactComponent as IconCaret } from 'assets/img/iconCaretRight.svg'
import styles from './NowPlaying.module.css'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import { useTrackCoverArt } from 'hooks/useImageSize'
import { SquareSizes } from 'models/common/ImageSizes'
import ShuffleButtonProvider from 'components/play-bar/shuffle-button/ShuffleButtonProvider'
import ActionsBar from './components/ActionsBar'
import { getIsCasting } from './store/selectors'
import { HapticFeedbackMessage } from 'services/native-mobile-interface/haptics'
import { getUserId } from 'store/account/selectors'
import {
  FavoriteSource,
  RepostSource,
  PlaybackSource,
  Name,
  ShareSource
} from 'services/analytics'
import { useRecord, make } from 'store/analytics/actions'
import { AudioState } from 'store/player/types'
import { withNullGuard } from 'utils/withNullGuard'
import CoSign, { Size } from 'components/co-sign/CoSign'
import { getAverageColor } from 'store/application/ui/average-color/slice'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

type OwnProps = {
  onClose: () => void
  audio: AudioState
}

type NowPlayingProps = OwnProps &
  ReturnType<ReturnType<typeof makeMapStateToProps>> &
  ReturnType<typeof mapDispatchToProps>

const SEEK_INTERVAL = 200
const RESTART_THRESHOLD_SEC = 3

const messages = {
  nowPlaying: 'Now Playing'
}

const g = withNullGuard((wide: NowPlayingProps) => {
  const { uid, source, user, track } = wide.currentQueueItem
  if (uid !== null && source !== null && user !== null && track !== null) {
    const currentQueueItem = { uid, source, user, track }
    return {
      ...wide,
      currentQueueItem
    }
  }
})

const NowPlaying = g(
  ({
    onClose,
    currentQueueItem,
    currentUserId,
    playCounter,
    audio,
    isPlaying,
    isBuffering,
    play,
    pause,
    reset,
    next,
    previous,
    seek,
    repeat,
    share,
    shuffle,
    save,
    unsave,
    repost,
    undoRepost,
    clickOverflow,
    goToRoute,
    isCasting,
    castMethod,
    averageRGBColor
  }) => {
    const { uid } = currentQueueItem
    const { track, user } = currentQueueItem

    // Keep a ref for the artwork and dynamically resize the width of the
    // image as the height changes (which is flexed).
    const artworkRef = useRef<HTMLDivElement | null>(null)
    useEffect(() => {
      if (artworkRef.current) {
        // 4px accounts for the borders on the image
        artworkRef.current.style.width = `${
          artworkRef.current.offsetHeight - 4
        }px`
      }
    }, [artworkRef, playCounter])

    // Store position and duration together so they only trigger one state change
    const [timing, setTiming] = useState({ position: 0, duration: 0 })
    // Additional media key to refresh scrubber in account for out of sync mobile seek position
    // and UI seek position
    const [mediaKey, setMediaKey] = useState(0)
    const seekInterval = useRef<number | undefined>(undefined)
    const [prevPlayCounter, setPrevPlayCounter] = useState<number | null>(null)

    const startSeeking = useCallback(() => {
      clearInterval(seekInterval.current)
      seekInterval.current = window.setInterval(async () => {
        if (!audio) return
        const position = await audio.getPosition()
        const duration = await audio.getDuration()
        setTiming({ position, duration })
      }, SEEK_INTERVAL)
    }, [audio, setTiming])

    // Clean up
    useEffect(() => {
      return () => {
        if (seekInterval.current) clearInterval(seekInterval.current)
      }
    }, [seekInterval])

    // The play counter changes (same song again or new song)
    useEffect(() => {
      if (playCounter !== prevPlayCounter) {
        setPrevPlayCounter(playCounter)
        setTiming({ position: 0, duration: timing.duration })
        setMediaKey(mediaKey => mediaKey + 1)
        startSeeking()
      }
    }, [
      playCounter,
      prevPlayCounter,
      startSeeking,
      timing,
      setTiming,
      setMediaKey
    ])

    const record = useRecord()

    const {
      title,
      track_id,
      owner_id,
      _cover_art_sizes,
      has_current_user_saved,
      has_current_user_reposted,
      _co_sign
    } = track
    const { name, handle } = user
    const image = useTrackCoverArt(
      track_id,
      _cover_art_sizes,
      SquareSizes.SIZE_480_BY_480
    )

    let playButtonStatus
    if (isBuffering) {
      playButtonStatus = PlayButtonStatus.LOAD
    } else if (isPlaying) {
      playButtonStatus = PlayButtonStatus.PAUSE
    } else {
      playButtonStatus = PlayButtonStatus.PLAY
    }

    const togglePlay = () => {
      const message = new HapticFeedbackMessage()
      message.send()
      if (isPlaying) {
        pause()
        record(
          make(Name.PLAYBACK_PAUSE, {
            id: `${track_id}`,
            source: PlaybackSource.NOW_PLAYING
          })
        )
      } else {
        play()
        record(
          make(Name.PLAYBACK_PLAY, {
            id: `${track_id}`,
            source: PlaybackSource.NOW_PLAYING
          })
        )
      }
    }

    const toggleFavorite = useCallback(() => {
      if (track_id) {
        has_current_user_saved ? unsave(track_id) : save(track_id)
      }
    }, [track_id, has_current_user_saved, unsave, save])

    const toggleRepost = useCallback(() => {
      if (track_id) {
        has_current_user_reposted ? undoRepost(track_id) : repost(track_id)
      }
    }, [track_id, has_current_user_reposted, undoRepost, repost])

    const onShare = useCallback(() => {
      share(track_id)
    }, [share, track_id])

    const goToTrackPage = () => {
      onClose()
      goToRoute(trackPage(handle, title, track_id))
    }

    const goToProfilePage = () => {
      onClose()
      goToRoute(profilePage(handle))
    }

    const onClickOverflow = useCallback(() => {
      const isOwner = currentUserId === owner_id

      const overflowActions = [
        !isOwner
          ? has_current_user_reposted
            ? OverflowAction.UNREPOST
            : OverflowAction.REPOST
          : null,
        !isOwner
          ? has_current_user_saved
            ? OverflowAction.UNFAVORITE
            : OverflowAction.FAVORITE
          : null,
        OverflowAction.SHARE,
        OverflowAction.ADD_TO_PLAYLIST,
        OverflowAction.VIEW_TRACK_PAGE,
        OverflowAction.VIEW_ARTIST_PAGE
      ].filter(Boolean) as OverflowAction[]
      const overflowCallbacks = {
        [OverflowAction.VIEW_TRACK_PAGE]: onClose,
        [OverflowAction.VIEW_ARTIST_PAGE]: onClose
      }
      clickOverflow(track_id, overflowActions, overflowCallbacks)
    }, [
      currentUserId,
      track_id,
      owner_id,
      clickOverflow,
      has_current_user_saved,
      has_current_user_reposted,
      onClose
    ])

    const onPrevious = () => {
      const shouldGoToPrevious = timing.position < RESTART_THRESHOLD_SEC
      if (shouldGoToPrevious) {
        previous()
      } else {
        reset(true /* shouldAutoplay */)
      }
    }

    const artworkAverageColor = averageRGBColor
      ? {
          boxShadow: `0 1px 15px -2px rgba(
          ${averageRGBColor.r},
          ${averageRGBColor.g},
          ${averageRGBColor.b}
          , 0.5)`
        }
      : {}

    return (
      <div
        className={cn(styles.nowPlaying, {
          [styles.native]: NATIVE_MOBILE
        })}
      >
        <div className={styles.header}>
          <div className={styles.caretContainer} onClick={onClose}>
            <IconCaret className={styles.iconCaret} />
          </div>
          <div className={styles.titleContainer}>{messages.nowPlaying}</div>
        </div>
        {_co_sign ? (
          <CoSign
            className={styles.artwork}
            size={Size.XLARGE}
            hasFavorited={_co_sign.has_remix_author_saved}
            hasReposted={_co_sign.has_remix_author_reposted}
            coSignName={_co_sign.user.name}
            isVerified={_co_sign.user.is_verified}
            forwardRef={artworkRef}
          >
            <div
              className={styles.image}
              onClick={goToTrackPage}
              style={artworkAverageColor}
            >
              <DynamicImage image={image} />
            </div>
          </CoSign>
        ) : (
          <div
            className={cn(styles.artwork, styles.image)}
            onClick={goToTrackPage}
            ref={artworkRef}
            style={artworkAverageColor}
          >
            <DynamicImage image={image} />
          </div>
        )}
        <div className={styles.info}>
          <div className={styles.title} onClick={goToTrackPage}>
            {title}
          </div>
          <div className={styles.artist} onClick={goToProfilePage}>
            {name}
            {user.is_verified ? (
              <IconVerified className={styles.verified} />
            ) : null}
          </div>
        </div>
        <div className={styles.timeControls}>
          <Scrubber
            // Include the duration in the media key because the play counter can
            // potentially udpate before the duration coming from the native layer if present
            mediaKey={`${uid}${mediaKey}${timing.duration}`}
            isPlaying={isPlaying && !isBuffering}
            isDisabled={!uid}
            isMobile
            elapsedSeconds={timing.position}
            totalSeconds={timing.duration}
            includeTimestamps
            onScrubRelease={seek}
            style={{
              handleColor: 'var(--static-white)'
            }}
          />
        </div>
        <div className={styles.controls}>
          <div className={styles.repeatButton}>
            <RepeatButtonProvider
              isMobile
              darkMode={isDarkMode()}
              onRepeatOff={() => repeat(RepeatMode.OFF)}
              onRepeatAll={() => repeat(RepeatMode.ALL)}
              onRepeatSingle={() => repeat(RepeatMode.SINGLE)}
            />
          </div>
          <div className={styles.previousButton}>
            <PreviousButton isMobile onClick={onPrevious} />
          </div>
          <div className={styles.playButton}>
            <PlayButton
              playable
              status={playButtonStatus}
              onClick={togglePlay}
            />
          </div>
          <div className={styles.nextButton}>
            <NextButton isMobile onClick={next} />
          </div>
          <div className={styles.shuffleButton}>
            <ShuffleButtonProvider
              isMobile
              darkMode={isDarkMode()}
              onShuffleOn={() => shuffle(true)}
              onShuffleOff={() => shuffle(false)}
            />
          </div>
        </div>
        <div className={styles.actions}>
          <ActionsBar
            castMethod={castMethod}
            isOwner={currentUserId === owner_id}
            hasReposted={has_current_user_reposted}
            hasFavorited={has_current_user_saved}
            isCasting={isCasting}
            onToggleRepost={toggleRepost}
            onToggleFavorite={toggleFavorite}
            onShare={onShare}
            onClickOverflow={onClickOverflow}
            isDarkMode={isDarkMode()}
          />
        </div>
      </div>
    )
  }
)

function makeMapStateToProps() {
  const getCurrentQueueItem = makeGetCurrent()

  const mapStateToProps = (state: AppState) => {
    const currentQueueItem = getCurrentQueueItem(state)
    return {
      currentQueueItem,
      currentUserId: getUserId(state),
      playCounter: getCounter(state),
      audio: getAudio(state),
      isPlaying: getPlaying(state),
      isBuffering: getBuffering(state),
      isCasting: getIsCasting(state),
      castMethod: getCastMethod(state),
      averageRGBColor: currentQueueItem.track
        ? getAverageColor(state, {
            multihash:
              currentQueueItem.track.cover_art_sizes ??
              currentQueueItem.track.cover_art ??
              ''
          })
        : null
    }
  }
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
    next: () => {
      dispatch(next({ skip: true }))
    },
    previous: () => {
      dispatch(previous({}))
    },
    reset: (shouldAutoplay: boolean) => {
      dispatch(reset({ shouldAutoplay }))
    },
    seek: (position: number) => {
      dispatch(seek({ seconds: position }))
    },
    repeat: (mode: RepeatMode) => {
      dispatch(repeat({ mode }))
    },
    shuffle: (enable: boolean) => {
      dispatch(shuffle({ enable }))
    },
    share: (trackId: ID) =>
      dispatch(shareTrack(trackId, ShareSource.NOW_PLAYING)),
    save: (trackId: ID) =>
      dispatch(saveTrack(trackId, FavoriteSource.NOW_PLAYING)),
    unsave: (trackId: ID) =>
      dispatch(unsaveTrack(trackId, FavoriteSource.NOW_PLAYING)),
    repost: (trackId: ID) =>
      dispatch(repostTrack(trackId, RepostSource.NOW_PLAYING)),
    undoRepost: (trackId: ID) =>
      dispatch(undoRepostTrack(trackId, RepostSource.NOW_PLAYING)),
    clickOverflow: (
      trackId: ID,
      overflowActions: OverflowAction[],
      callbacks: OverflowActionCallbacks
    ) =>
      dispatch(
        open(OverflowSource.TRACKS, trackId, overflowActions, callbacks)
      ),
    goToRoute: (route: string) => dispatch(pushRoute(route))
  }
}

export default connect(makeMapStateToProps, mapDispatchToProps)(NowPlaying)
