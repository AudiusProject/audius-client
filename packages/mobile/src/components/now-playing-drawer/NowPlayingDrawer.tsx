import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

import {
  Genre,
  cacheUsersSelectors,
  queueActions,
  playerSelectors,
  playerActions
} from '@audius/common'
import type {
  Animated,
  GestureResponderEvent,
  PanResponderGestureState
} from 'react-native'
import { Platform, View, StatusBar, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import TrackPlayer from 'react-native-track-player'
import { useDispatch, useSelector } from 'react-redux'

import { BOTTOM_BAR_HEIGHT } from 'app/components/bottom-tab-bar'
import Drawer, {
  DrawerAnimationStyle,
  FULL_DRAWER_HEIGHT
} from 'app/components/drawer'
import { Scrubber } from 'app/components/scrubber'
import { useDrawer } from 'app/hooks/useDrawer'
import { useNavigation } from 'app/hooks/useNavigation'
import { AppDrawerContext } from 'app/screens/app-drawer-screen'
import { AppTabNavigationContext } from 'app/screens/app-screen'
import { getAndroidNavigationBarHeight } from 'app/store/mobileUi/selectors'
import { makeStyles } from 'app/styles'

import { ActionsBar } from './ActionsBar'
import { Artwork } from './Artwork'
import { AudioControls } from './AudioControls'
import { Logo } from './Logo'
import { PlayBar } from './PlayBar'
import { TitleBar } from './TitleBar'
import { TrackInfo } from './TrackInfo'
import { PLAY_BAR_HEIGHT } from './constants'
const { seek, reset } = playerActions

const { getPlaying, getCurrentTrack, getCounter, getUid } = playerSelectors
const { next, previous } = queueActions
const { getUser } = cacheUsersSelectors

const STATUS_BAR_FADE_CUTOFF = 0.6
const SKIP_DURATION_SEC = 15
const RESTART_THRESHOLD_SEC = 3

// If the top screen inset is greater than this,
// the status bar will be hidden when the drawer is open
const INSET_STATUS_BAR_HIDE_THRESHOLD = 20

const useStyles = makeStyles(({ spacing }) => ({
  container: {
    paddingTop: 0,
    height: FULL_DRAWER_HEIGHT,
    justifyContent: 'space-evenly'
  },
  playBarContainer: {
    position: 'absolute',
    width: '100%',
    top: 0
  },
  controlsContainer: {
    marginHorizontal: spacing(6),
    marginBottom: spacing(6)
  },
  titleBarContainer: {
    marginBottom: spacing(4)
  },
  artworkContainer: {
    flexShrink: 1,
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

/**
 * Memoized to prevent rerender during bottom-bar navigation.
 * It's rerendering because bottomTab render function rerenders a lot.
 */
export const NowPlayingDrawer = memo(function NowPlayingDrawer(
  props: NowPlayingDrawerProps
) {
  const { translationAnim } = props
  const { navigation: contextNavigation } = useContext(AppTabNavigationContext)
  const navigation = useNavigation({
    customNavigation: contextNavigation
  })
  const dispatch = useDispatch()
  const insets = useSafeAreaInsets()
  const androidNavigationBarHeight = useSelector(getAndroidNavigationBarHeight)
  const staticTopInset = useRef(insets.top)
  const bottomBarHeight =
    BOTTOM_BAR_HEIGHT + (Platform.OS === 'ios' ? insets.bottom : 0)
  const styles = useStyles()

  const { isOpen, onOpen, onClose } = useDrawer('NowPlaying')
  console.log('isOpen?', isOpen)
  const playCounter = useSelector(getCounter)
  const currentUid = useSelector(getUid)
  const isPlaying = useSelector(getPlaying)
  const [isPlayBarShowing, setIsPlayBarShowing] = useState(false)

  const { drawerNavigation } = useContext(AppDrawerContext)

  // When audio starts playing, open the playbar to the initial offset
  useEffect(() => {
    if (isPlaying && !isPlayBarShowing) {
      setIsPlayBarShowing(true)
    }
  }, [isPlaying, isPlayBarShowing])

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

  useEffect(() => {
    // The top inset can be 0 initially
    // Need to get the actual value but preserve it when the
    // status bar is hidden
    if (staticTopInset.current === 0 && insets.top > 0) {
      staticTopInset.current = insets.top
    }
  }, [staticTopInset, insets.top])

  useEffect(() => {
    if (
      Platform.OS === 'ios' &&
      staticTopInset.current > INSET_STATUS_BAR_HIDE_THRESHOLD
    ) {
      if (isOpen) {
        StatusBar.setHidden(true, 'fade')
      } else {
        StatusBar.setHidden(false, 'fade')
      }
    }
  }, [isOpen])

  // Attach to the pan responder of the drawer so that we can animate away
  // the status bar
  const onPanResponderMove = useCallback(
    (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      // Do not hide the status bar for smaller insets
      // This is to prevent layout shift which breaks the animation
      if (
        Platform.OS === 'ios' &&
        staticTopInset.current > INSET_STATUS_BAR_HIDE_THRESHOLD
      ) {
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
      }
    },
    [drawerPercentOpen]
  )

  const onPanResponderRelease = useCallback(
    (e: GestureResponderEvent, _gestureState: PanResponderGestureState) => {
      // Immediately after the pan responder is released, disable the notifications drawer.
      // Allow the effect attached to the open state changing to re-define whether it can be
      // interacted with.
      drawerNavigation?.setOptions({ swipeEnabled: false })
    },
    [drawerNavigation]
  )

  const [isGestureEnabled, setIsGestureEnabled] = useState(true)

  const track = useSelector(getCurrentTrack)
  const trackId = track?.track_id
  const trackDuration = track?.duration ?? 0

  const user = useSelector((state) =>
    getUser(state, track ? { id: track.owner_id } : {})
  )
  const [mediaKey, setMediaKey] = useState(0)

  useEffect(() => {
    setMediaKey((mediaKey) => mediaKey + 1)
  }, [playCounter, currentUid])

  const onNext = useCallback(async () => {
    if (track?.genre === Genre.PODCASTS) {
      const currentPosition = await TrackPlayer.getPosition()
      const newPosition = currentPosition + SKIP_DURATION_SEC
      dispatch(seek({ seconds: Math.min(track.duration, newPosition) }))
    } else {
      dispatch(next({ skip: true }))
      setMediaKey((mediaKey) => mediaKey + 1)
    }
  }, [dispatch, setMediaKey, track])

  const onPrevious = useCallback(async () => {
    const currentPosition = await TrackPlayer.getPosition()
    if (track?.genre === Genre.PODCASTS) {
      const newPosition = currentPosition - SKIP_DURATION_SEC
      dispatch(seek({ seconds: Math.max(0, newPosition) }))
    } else {
      const shouldGoToPrevious = currentPosition < RESTART_THRESHOLD_SEC
      if (shouldGoToPrevious) {
        dispatch(previous())
        setMediaKey((mediaKey) => mediaKey + 1)
      } else {
        dispatch(reset({ shouldAutoplay: true }))
      }
    }
  }, [dispatch, setMediaKey, track])

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
    navigation?.push('Profile', { handle: user.handle })
    handleDrawerCloseFromSwipe()
  }, [handleDrawerCloseFromSwipe, navigation, user])

  const handlePressTitle = useCallback(() => {
    if (!trackId) {
      return
    }
    navigation?.push('Track', { id: trackId })
    handleDrawerCloseFromSwipe()
  }, [handleDrawerCloseFromSwipe, navigation, trackId])

  return (
    <Drawer
      // Appears below bottom bar whereas normally drawers appear above
      zIndex={3}
      isOpen={isOpen}
      onClose={handleDrawerCloseFromSwipe}
      onOpen={onDrawerOpen}
      initialOffsetPosition={
        bottomBarHeight + PLAY_BAR_HEIGHT + androidNavigationBarHeight
      }
      shouldCloseToInitialOffset={isPlayBarShowing}
      animationStyle={DrawerAnimationStyle.SPRINGY}
      shouldBackgroundDim={false}
      shouldAnimateShadow={false}
      drawerStyle={{ overflow: 'visible' }}
      onPercentOpen={onDrawerPercentOpen}
      onPanResponderMove={onPanResponderMove}
      onPanResponderRelease={onPanResponderRelease}
      isGestureSupported={isGestureEnabled}
      translationAnim={translationAnim}
      // Disable safe area view edges because they are handled manually
      disableSafeAreaView
    >
      <View
        style={[
          styles.container,
          { paddingTop: staticTopInset.current, paddingBottom: insets.bottom }
        ]}
      >
        <View style={styles.playBarContainer}>
          <PlayBar
            mediaKey={`${mediaKey}`}
            track={track}
            user={user}
            onPress={onDrawerOpen}
            translationAnim={translationAnim}
          />
        </View>
        <Logo translationAnim={translationAnim} />
        <View style={styles.titleBarContainer}>
          <TitleBar onClose={handleDrawerCloseFromSwipe} />
        </View>
        <Pressable onPress={handlePressTitle} style={styles.artworkContainer}>
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
            duration={trackDuration}
          />
        </View>
        <View style={styles.controlsContainer}>
          <AudioControls
            onNext={onNext}
            onPrevious={onPrevious}
            isPodcast={track?.genre === Genre.PODCASTS}
          />
          <ActionsBar track={track} />
        </View>
      </View>
    </Drawer>
  )
})
