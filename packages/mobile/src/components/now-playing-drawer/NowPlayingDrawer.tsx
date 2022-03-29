import { useCallback, useEffect, useRef, useState } from 'react'

import { getTrack } from 'audius-client/src/common/store/cache/tracks/selectors'
import { getUser } from 'audius-client/src/common/store/cache/users/selectors'
import { next, previous } from 'audius-client/src/common/store/queue/slice'
import { Genre } from 'audius-client/src/common/utils/genres'
import {
  View,
  Animated,
  GestureResponderEvent,
  PanResponderGestureState,
  StatusBar,
  Pressable
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'

import { BOTTOM_BAR_HEIGHT } from 'app/components/bottom-tab-bar'
import Drawer, {
  DrawerAnimationStyle,
  FULL_DRAWER_HEIGHT
} from 'app/components/drawer'
import { Scrubber } from 'app/components/scrubber'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useDrawer } from 'app/hooks/useDrawer'
import { useNavigation } from 'app/hooks/useNavigation'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { SEEK, seek } from 'app/store/audio/actions'
import {
  getPlaying,
  getTrack as getNativeTrack
} from 'app/store/audio/selectors'
import { makeStyles } from 'app/styles'

import { ActionsBar } from './ActionsBar'
import { Artwork } from './Artwork'
import { AudioControls } from './AudioControls'
import { Logo } from './Logo'
import { PlayBar } from './PlayBar'
import { TitleBar } from './TitleBar'
import { TrackInfo } from './TrackInfo'
import { PLAY_BAR_HEIGHT } from './constants'

const STATUS_BAR_FADE_CUTOFF = 0.6
const SKIP_DURATION_SEC = 15

const useStyles = makeStyles(({ spacing }) => ({
  container: {
    paddingTop: 0,
    minHeight: FULL_DRAWER_HEIGHT,
    justifyContent: 'space-evenly'
  },
  controlsContainer: {
    marginHorizontal: spacing(6),
    marginBottom: spacing(6)
  },
  titleBarContainer: {
    marginBottom: spacing(4)
  },
  artworkContainer: {
    maxHeight: FULL_DRAWER_HEIGHT * 0.4,
    marginBottom: spacing(5)
  },
  trackInfoContainer: {
    marginHorizontal: spacing(6),
    marginBottom: spacing(3)
  },
  scrubberContainer: {
    marginHorizontal: spacing(6)
  }
}))

type NowPlayingDrawerProps = {
  translationAnim: Animated.Value
}

const NowPlayingDrawer = ({ translationAnim }: NowPlayingDrawerProps) => {
  const dispatch = useDispatch()
  const dispatchWeb = useDispatchWeb()
  const insets = useSafeAreaInsets()
  const bottomBarHeight = BOTTOM_BAR_HEIGHT + insets.bottom
  const styles = useStyles()
  const navigation = useNavigation()

  const { isOpen, onOpen, onClose } = useDrawer('NowPlaying')
  const isPlaying = useSelector(getPlaying)
  const [isPlayBarShowing, setIsPlayBarShowing] = useState(false)

  // When audio starts playing, open the playbar to the initial offset
  useEffect(() => {
    if (isPlaying && !isPlayBarShowing) {
      setIsPlayBarShowing(true)
    }
  }, [isPlaying, isPlayBarShowing])

  useEffect(() => {
    if (isOpen) {
      StatusBar.setHidden(true, 'fade')
    } else {
      StatusBar.setHidden(false, 'fade')
    }
  }, [isOpen])

  const handleDrawerCloseFromSwipe = useCallback(() => {
    onClose()
  }, [onClose])

  const onDrawerOpen = useCallback(() => {
    onOpen()
  }, [onOpen])

  const drawerPercentOpen = useRef(0)
  const onDrawerPercentOpen = useCallback(
    (percentOpen: number) => {
      drawerPercentOpen.current = percentOpen
    },
    [drawerPercentOpen]
  )

  // Attach to the pan responder of the drawer so that we can animate away
  // the bottom bar as the drawer is dragged open
  const onPanResponderMove = useCallback(
    (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      if (gestureState.vy > 0) {
        // Dragging downwards
        if (drawerPercentOpen.current < STATUS_BAR_FADE_CUTOFF) {
          StatusBar.setHidden(false, 'fade')
        }
      } else if (gestureState.vy < 0) {
        // Dragging upwards
        if (drawerPercentOpen.current > STATUS_BAR_FADE_CUTOFF) {
          StatusBar.setHidden(true, 'fade')
        }
      }
    },
    [drawerPercentOpen]
  )

  const [isGestureEnabled, setIsGestureEnabled] = useState(true)

  // TODO: As we move away from the audio store slice in mobile-client
  // in favor of player/queue selectors in common, getNativeTrack calls
  // should be replaced
  const trackInfo = useSelector(getNativeTrack)
  const track = useSelectorWeb(state =>
    getTrack(state, trackInfo ? { id: trackInfo.trackId } : {})
  )
  const user = useSelectorWeb(state =>
    getUser(state, track ? { id: track.owner_id } : {})
  )

  const trackId = trackInfo?.trackId
  const [mediaKey, setMediaKey] = useState(0)
  useEffect(() => {
    setMediaKey(mediaKey => mediaKey + 1)
  }, [trackId])

  const onNext = useCallback(() => {
    if (track?.genre === Genre.PODCASTS) {
      if (global.progress) {
        const { currentTime } = global.progress
        const newPosition = currentTime + SKIP_DURATION_SEC
        dispatch(
          seek({ type: SEEK, seconds: Math.min(track.duration, newPosition) })
        )
      }
    } else {
      dispatchWeb(next({ skip: true }))
      setMediaKey(mediaKey => mediaKey + 1)
    }
  }, [dispatch, dispatchWeb, setMediaKey, track])

  const onPrevious = useCallback(() => {
    if (track?.genre === Genre.PODCASTS) {
      if (global.progress) {
        const { currentTime } = global.progress
        const newPosition = currentTime - SKIP_DURATION_SEC
        dispatch(seek({ type: SEEK, seconds: Math.max(0, newPosition) }))
      }
    } else {
      dispatchWeb(previous({}))
      setMediaKey(mediaKey => mediaKey + 1)
    }
  }, [dispatch, dispatchWeb, setMediaKey, track])

  const onPressScrubberIn = useCallback(() => {
    setIsGestureEnabled(false)
  }, [setIsGestureEnabled])

  const onPressScrubberOut = useCallback(() => {
    setIsGestureEnabled(true)
  }, [setIsGestureEnabled])

  const handlePressArtist = useCallback(() => {
    if (!user) {
      return
    }
    navigation.push({
      native: { screen: 'Profile', params: { handle: user.handle } },
      web: { route: `/${user.handle}` }
    })
    handleDrawerCloseFromSwipe()
  }, [handleDrawerCloseFromSwipe, navigation, user])

  const handlePressTitle = useCallback(() => {
    if (!track) {
      return
    }
    navigation.push({
      native: { screen: 'Track', params: { id: track.track_id } },
      web: { route: track.permalink }
    })
    handleDrawerCloseFromSwipe()
  }, [handleDrawerCloseFromSwipe, navigation, track])

  return (
    <Drawer
      // Appears below bottom bar whereas normally drawers appear above
      zIndex={3}
      isOpen={isOpen}
      onClose={handleDrawerCloseFromSwipe}
      onOpen={onDrawerOpen}
      initialOffsetPosition={bottomBarHeight + PLAY_BAR_HEIGHT}
      shouldCloseToInitialOffset={isPlayBarShowing}
      animationStyle={DrawerAnimationStyle.SPRINGY}
      shouldBackgroundDim={false}
      shouldAnimateShadow={false}
      drawerStyle={{ overflow: 'visible' }}
      onPercentOpen={onDrawerPercentOpen}
      onPanResponderMove={onPanResponderMove}
      isGestureSupported={isGestureEnabled}
      translationAnim={translationAnim}
      // Disable safe area view edges because they are handled manually
      disableSafeAreaView
    >
      <View style={styles.container}>
        {track && user && (
          <>
            <View style={{ position: 'absolute', width: '100%', top: 0 }}>
              <PlayBar
                track={track}
                user={user}
                onPress={onDrawerOpen}
                translationAnim={translationAnim}
              />
            </View>
            <Logo translationAnim={translationAnim} />
            <View>
              <View style={styles.titleBarContainer}>
                <TitleBar onClose={handleDrawerCloseFromSwipe} />
              </View>
              <Pressable
                onPress={handlePressTitle}
                style={styles.artworkContainer}
              >
                <Artwork track={track} />
              </Pressable>
              <View style={styles.trackInfoContainer}>
                <TrackInfo
                  onPressArtist={handlePressArtist}
                  onPressTitle={handlePressTitle}
                  track={track}
                  user={user}
                />
              </View>
              <View style={styles.scrubberContainer}>
                <Scrubber
                  mediaKey={`${mediaKey}`}
                  isPlaying={isPlaying}
                  onPressIn={onPressScrubberIn}
                  onPressOut={onPressScrubberOut}
                  duration={track.duration}
                />
              </View>
              <View style={styles.controlsContainer}>
                <AudioControls
                  onNext={onNext}
                  onPrevious={onPrevious}
                  isPodcast={track.genre === Genre.PODCASTS}
                />
                <ActionsBar track={track} />
              </View>
            </View>
          </>
        )}
      </View>
    </Drawer>
  )
}

export default NowPlayingDrawer
