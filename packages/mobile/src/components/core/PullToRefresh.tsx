import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import LottieView from 'lottie-react-native'
import type {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView
} from 'react-native'
import { Animated } from 'react-native'
import { usePrevious } from 'react-use'

import IconRefreshPull from 'app/assets/animations/iconRefreshPull.json'
import IconRefreshSpin from 'app/assets/animations/iconRefreshSpin.json'
import * as haptics from 'app/haptics'
import { makeStyles } from 'app/styles'
import { attachToScroll } from 'app/utils/animation'
import { colorize } from 'app/utils/colorizeLottie'
import { useThemeColors } from 'app/utils/theme'

const PULL_DISTANCE = 75
const DEBOUNCE_TIME_MS = 1000

const useStyles = makeStyles((_, topOffset: number) => ({
  root: {
    width: '100%',
    position: 'absolute',
    height: 20,
    top: topOffset,
    zIndex: 10
  }
}))

const interpolateTranslateY = (scrollAnim: Animated.Value) =>
  scrollAnim.interpolate({
    inputRange: [-24, 0],
    outputRange: [10, 0],
    extrapolateLeft: 'extend',
    extrapolateRight: 'clamp'
  })

const interpolateOpacity = (scrollAnim: Animated.Value) =>
  scrollAnim.interpolate({
    inputRange: [-60, -16],
    outputRange: [1, 0],
    extrapolateRight: 'clamp'
  })

type UseOverflowHandlersConfig = {
  isRefreshing?: boolean | null
  scrollResponder?: FlatList<any> | Animated.FlatList<any> | ScrollView | null
  onRefresh?: (() => void) | null
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void
}

/**
 * A helper hook to get desired pull to refresh behavior.
 * 1. Momentum scrolling does not trigger pull to refresh
 */
export const useOverflowHandlers = ({
  isRefreshing,
  scrollResponder,
  onRefresh,
  onScroll
}: UseOverflowHandlersConfig) => {
  const scrollAnim = useRef(new Animated.Value(0)).current

  const [isMomentumScroll, setIsMomentumScroll] = useState(false)
  const [isDebouncing, setIsDebouncing] = useState(false)
  const currentYOffset = useRef(0)
  const wasRefreshing = usePrevious(isRefreshing)

  const handleRefresh = useCallback(() => {
    onRefresh?.()
    setIsDebouncing(true)
    setTimeout(() => {
      setIsDebouncing(false)
    }, DEBOUNCE_TIME_MS)
  }, [onRefresh])

  const scrollTo = useCallback(
    (y: number, animated = true) => {
      if (scrollResponder && 'scrollTo' in scrollResponder) {
        scrollResponder?.scrollTo({ y, animated })
      }
      if (scrollResponder && 'scrollToOffset' in scrollResponder) {
        scrollResponder?.scrollToOffset({ offset: y })
      }
    },
    [scrollResponder]
  )

  useEffect(() => {
    console.log('currentYOffset', currentYOffset.current)
    if (
      !isRefreshing &&
      wasRefreshing &&
      // !isDebouncing &&
      isMomentumScroll &&
      currentYOffset.current <= -50
    ) {
      scrollTo(0)
    }
  }, [isRefreshing, wasRefreshing, isDebouncing, scrollTo, isMomentumScroll])

  const handleScroll = useCallback(
    (e) => {
      currentYOffset.current = e.nativeEvent.contentOffset.y
      console.log('handle scroll', e.nativeEvent.contentOffset)
      onScroll?.(e)
    },
    [onScroll]
  )

  const onScrollBeginDrag = useCallback(
    (e) => {
      currentYOffset.current = e.nativeEvent.contentOffset.y
      console.log('handle begin drag', e.nativeEvent.contentOffset)
      setIsMomentumScroll(false)
    },
    [setIsMomentumScroll]
  )

  const onScrollEndDrag = useCallback(
    (e) => {
      currentYOffset.current = e.nativeEvent.contentOffset.y
      console.log('handle end drag', e.nativeEvent.contentOffset)
      setIsMomentumScroll(true)
      if (isRefreshing && currentYOffset.current < -50) {
        scrollTo(-50, false)
      }
    },
    [setIsMomentumScroll, scrollTo, isRefreshing]
  )

  const handleScrolll = attachToScroll(scrollAnim, { listener: handleScroll })

  return {
    isRefreshing: onRefresh ? isRefreshing || isDebouncing : undefined,
    isRefreshDisabled: isMomentumScroll,
    handleRefresh: onRefresh ? handleRefresh : undefined,
    scrollAnim,
    handleScroll: handleScrolll,
    onScrollBeginDrag,
    onScrollEndDrag
  }
}

type PullToRefreshProps = {
  isRefreshing?: boolean
  onRefresh?: () => void
  scrollAnim?: Animated.Value
  isRefreshDisabled?: boolean
  topOffset?: number
  color?: string
}

/**
 * Custom pull to refresh to be used with React Native ScrollViews
 * (FlatList, SectionList, etc.).
 *
 * Usage:
 * ```
 * const scrollAnim = useRef(new Animated.Value(0)).current
 *
 * const MyList = () => {
 *  return (
 *    <View>
 *      <PullToRefresh
 *        isRefreshing={}
 *        onRefresh={}
 *      />
 *      <ScrollView
 *        onScroll={attachToScroll(scrollAnim)}
 *        {...props}
 *      />
 *  )
 * }
 * ```
 *
 * Two usage modes of PullToRefresh are provided.
 * If the PullToRefresh is intended to appear in the overscroll
 * space above the view, see `useOverscrollHandlers`
 * Otherwise, the component may suffice.
 */
export const PullToRefresh = ({
  isRefreshing,
  onRefresh,
  isRefreshDisabled,
  scrollAnim,
  topOffset = 0,
  color
}: PullToRefreshProps) => {
  const styles = useStyles(topOffset)
  const { neutralLight4 } = useThemeColors()

  const [didHitTop, setDidHitTop] = useState(false)
  const hitTop = useRef(false)

  const [shouldShowSpinner, setShouldShowSpinner] = useState(false)
  const [shouldShowRefresh, setShouldShowRefresh] = useState(true)
  const animationRef = useRef<LottieView | null>()

  const icon = shouldShowSpinner ? IconRefreshSpin : IconRefreshPull
  const colorizedIcon = useMemo(
    () =>
      colorize(icon, {
        // arrow Outlines 4.Group 1.Stroke 1
        'assets.0.layers.0.shapes.0.it.1.c.k': color || neutralLight4,
        // arrow Outlines 2.Group 3.Stroke 1
        'layers.1.shapes.0.it.1.c.k': color || neutralLight4,
        // arrow Outlines.Group 1.Stroke 1
        'layers.2.shapes.0.it.1.c.k': color || neutralLight4,
        // arrow Outlines.Group 2.Stroke 1
        'layers.2.shapes.1.it.1.c.k': color || neutralLight4
      }),
    [icon, color, neutralLight4]
  )

  const handleAnimationFinish = useCallback(
    (isCancelled: boolean) => {
      if (!isCancelled) {
        setShouldShowSpinner(true)
        setImmediate(() => {
          animationRef.current?.play()
        })
      }
    },
    [setShouldShowSpinner]
  )

  useEffect(() => {
    if (!isRefreshing && isRefreshDisabled) {
      hitTop.current = false
      setDidHitTop(false)
      // Reset animation after a timeout so there's enough time
      // to reset the scroll with the spinner animation showing.
      setShouldShowSpinner(false)
      setShouldShowRefresh(true)
      animationRef.current?.reset()
    }
  }, [isRefreshing, hitTop, isRefreshDisabled])

  const listenerRef = useRef<string>()

  useEffect(() => {
    listenerRef.current = scrollAnim?.addListener(
      ({ value }: { value: number }) => {
        if (
          value < -1 * PULL_DISTANCE &&
          !hitTop.current &&
          !isRefreshDisabled
        ) {
          hitTop.current = true
          setDidHitTop(true)
          haptics.light()
          onRefresh?.()
          animationRef.current?.play()
        }
        if (value > 0 && didHitTop) {
          setShouldShowRefresh(false)
        }
      }
    )
    return () => {
      if (listenerRef.current) {
        scrollAnim?.removeListener(listenerRef.current)
      }
    }
  }, [scrollAnim, onRefresh, isRefreshDisabled, didHitTop])

  return scrollAnim && shouldShowRefresh ? (
    <Animated.View
      style={[
        styles.root,
        {
          transform: [
            {
              translateY: interpolateTranslateY(scrollAnim)
            }
          ],
          opacity: didHitTop ? 1 : interpolateOpacity(scrollAnim)
        }
      ]}
    >
      <LottieView
        ref={(animation) => (animationRef.current = animation)}
        loop={shouldShowSpinner}
        autoPlay={false}
        source={colorizedIcon}
        onAnimationFinish={handleAnimationFinish}
      />
    </Animated.View>
  ) : null
}
