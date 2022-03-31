import { useCallback, useMemo } from 'react'

import { getRepeat, getShuffle } from 'common/store/queue/selectors'
import { shuffle, repeat } from 'common/store/queue/slice'
import { RepeatMode } from 'common/store/queue/types'
import { Animated, View, StyleSheet } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import IconPause from 'app/assets/animations/iconPause.json'
import IconPlay from 'app/assets/animations/iconPlay.json'
import IconRepeatAllLight from 'app/assets/animations/iconRepeatAllLight.json'
import IconRepeatOffLight from 'app/assets/animations/iconRepeatOffLight.json'
import IconRepeatSingleLight from 'app/assets/animations/iconRepeatSingleLight.json'
import IconShuffleOffLight from 'app/assets/animations/iconShuffleOffLight.json'
import IconShuffleOnLight from 'app/assets/animations/iconShuffleOnLight.json'
import IconNext from 'app/assets/images/iconNext.svg'
import IconPodcastBack from 'app/assets/images/iconPodcastBack.svg'
import IconPodcastForward from 'app/assets/images/iconPodcastForward.svg'
import IconPrev from 'app/assets/images/iconPrev.svg'
import { AnimatedButton, IconButton } from 'app/components/core'
import * as haptics from 'app/haptics'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { usePressScaleAnimation } from 'app/hooks/usePressScaleAnimation'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { useThemedStyles } from 'app/hooks/useThemedStyles'
import { pause, play } from 'app/store/audio/actions'
import { getPlaying } from 'app/store/audio/selectors'
import { colorize } from 'app/utils/colorizeLottie'
import { ThemeColors, useThemeColors } from 'app/utils/theme'

const createStyles = (themeColors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginTop: 40,
      height: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly'
    },
    button: {
      flexGrow: 1,
      display: 'flex',
      alignItems: 'center'
    },
    playIcon: {
      width: 80,
      height: 80
    },
    nextPrevIcons: {
      width: 30,
      height: 30
    },
    shuffleRepeatIcons: {
      width: 24,
      height: 24
    }
  })

type AudioControlsProps = {
  onNext: () => void
  onPrevious: () => void
  isPodcast?: boolean
}

export const AudioControls = ({
  onNext,
  onPrevious,
  isPodcast = false
}: AudioControlsProps) => {
  const dispatch = useDispatch()
  const dispatchWeb = useDispatchWeb()

  const styles = useThemedStyles(createStyles)
  const { background, neutral, primary } = useThemeColors()

  const isPlaying = useSelector(getPlaying)
  const shuffleEnabled = useSelectorWeb(getShuffle)
  const repeatMode = useSelectorWeb(getRepeat)

  const {
    scale,
    handlePressIn: handlePressInScale,
    handlePressOut: handlePressOutScale
  } = usePressScaleAnimation()

  const onPressPlayButton = useCallback(() => {
    haptics.light()
    if (isPlaying) {
      dispatch(pause())
    } else {
      dispatch(play())
    }
  }, [isPlaying, dispatch])

  const onPressShuffle = useCallback(() => {
    let enable: boolean
    if (shuffleEnabled) {
      enable = false
    } else {
      enable = true
    }
    dispatchWeb(shuffle({ enable }))
  }, [dispatchWeb, shuffleEnabled])

  const onPressRepeat = useCallback(() => {
    let mode: RepeatMode
    switch (repeatMode) {
      case RepeatMode.ALL:
        mode = RepeatMode.SINGLE
        break
      case RepeatMode.OFF:
        mode = RepeatMode.ALL
        break
      case RepeatMode.SINGLE:
        mode = RepeatMode.OFF
        break
    }
    dispatchWeb(repeat({ mode }))
  }, [dispatchWeb, repeatMode])

  const ColorizedRepeatAllIcon = useMemo(
    () =>
      colorize(IconRepeatAllLight, {
        // repeat number Outlines.Group 1.Fill 1
        'assets.0.layers.0.shapes.0.it.1.c.k': background,
        // repeat number Outlines.Group 2.Fill 1
        'assets.0.layers.0.shapes.1.it.1.c.k': primary,
        // repeat number Outlines.Group 3.Fill 1
        'assets.0.layers.0.shapes.2.it.1.c.k': background,
        // repeat number Outlines.Group 4.Fill 1
        'assets.0.layers.0.shapes.3.it.1.c.k': '#000000',
        // repeat Outlines.Group 2.Fill 1
        'assets.0.layers.1.shapes.0.it.1.c.k.0.s': neutral,
        // repeat Outlines.Group 2.Fill 1
        'assets.0.layers.1.shapes.0.it.1.c.k.0.e': primary,
        // repeat Outlines.Group 2.Fill 1
        'assets.0.layers.1.shapes.0.it.1.c.k.1.s': primary,
        // repeat Outlines.Group 2.Fill 1
        'assets.0.layers.1.shapes.0.it.1.c.k.1.e': primary,
        // repeat Outlines.Group 2.Fill 1
        'assets.0.layers.1.shapes.0.it.1.c.k.2.s': primary,
        // repeat Outlines.Group 2.Fill 1
        'assets.0.layers.1.shapes.0.it.1.c.k.2.e': neutral,
        // repeat number Outlines.Group 1.Fill 1
        'layers.1.shapes.0.it.1.c.k': background,
        // repeat number Outlines.Group 2.Fill 1
        'layers.1.shapes.1.it.1.c.k': primary,
        // repeat number Outlines.Group 3.Fill 1
        'layers.1.shapes.2.it.1.c.k': background,
        // repeat number Outlines.Group 4.Fill 1
        'layers.1.shapes.3.it.1.c.k': '#000000',
        // repeat Outlines.Group 2.Fill 1
        'layers.2.shapes.0.it.1.c.k.0.s': neutral,
        // repeat Outlines.Group 2.Fill 1
        'layers.2.shapes.0.it.1.c.k.0.e': primary,
        // repeat Outlines.Group 2.Fill 1
        'layers.2.shapes.0.it.1.c.k.1.s': primary,
        // repeat Outlines.Group 2.Fill 1
        'layers.2.shapes.0.it.1.c.k.1.e': primary,
        // repeat Outlines.Group 2.Fill 1
        'layers.2.shapes.0.it.1.c.k.2.s': primary,
        // repeat Outlines.Group 2.Fill 1
        'layers.2.shapes.0.it.1.c.k.2.e': neutral
      }),
    [background, neutral, primary]
  )

  const ColorizedRepeatSingleIcon = useMemo(
    () =>
      colorize(IconRepeatSingleLight, {
        // repeat number Outlines.Group 1.Fill 1
        'layers.0.shapes.0.it.1.c.k': background,
        // repeat number Outlines.Group 2.Fill 1
        'layers.0.shapes.1.it.1.c.k': primary,
        // repeat number Outlines.Group 3.Fill 1
        'layers.0.shapes.2.it.1.c.k': background,
        // repeat number Outlines.Group 4.Fill 1
        'layers.0.shapes.3.it.1.c.k': '#000000',
        // repeat Outlines.Group 2.Fill 1
        'layers.1.shapes.0.it.1.c.k.0.s': neutral,
        // repeat Outlines.Group 2.Fill 1
        'layers.1.shapes.0.it.1.c.k.0.e': primary,
        // repeat Outlines.Group 2.Fill 1
        'layers.1.shapes.0.it.1.c.k.1.s': primary,
        // repeat Outlines.Group 2.Fill 1
        'layers.1.shapes.0.it.1.c.k.1.e': primary,
        // repeat Outlines.Group 2.Fill 1
        'layers.1.shapes.0.it.1.c.k.2.s': primary,
        // repeat Outlines.Group 2.Fill 1
        'layers.1.shapes.0.it.1.c.k.2.e': neutral
      }),
    [background, neutral, primary]
  )

  const ColorizedRepeatOffIcon = useMemo(
    () =>
      colorize(IconRepeatOffLight, {
        // repeat number Outlines.Group 1.Fill 1
        'layers.0.shapes.0.it.1.c.k': background,
        // repeat number Outlines.Group 2.Fill 1
        'layers.0.shapes.1.it.1.c.k': primary,
        // repeat number Outlines.Group 3.Fill 1
        'layers.0.shapes.2.it.1.c.k': background,
        // repeat number Outlines.Group 4.Fill 1
        'layers.0.shapes.3.it.1.c.k': '#000000',
        // repeat Outlines.Group 2.Fill 1
        'layers.1.shapes.0.it.1.c.k.0.s': neutral,
        // repeat Outlines.Group 2.Fill 1
        'layers.1.shapes.0.it.1.c.k.0.e': primary,
        // repeat Outlines.Group 2.Fill 1
        'layers.1.shapes.0.it.1.c.k.1.s': primary,
        // repeat Outlines.Group 2.Fill 1
        'layers.1.shapes.0.it.1.c.k.1.e': primary,
        // repeat Outlines.Group 2.Fill 1
        'layers.1.shapes.0.it.1.c.k.2.s': primary,
        // repeat Outlines.Group 2.Fill 1
        'layers.1.shapes.0.it.1.c.k.2.e': neutral
      }),
    [background, neutral, primary]
  )

  const repeatIconJSON = [
    ColorizedRepeatAllIcon,
    ColorizedRepeatSingleIcon,
    ColorizedRepeatOffIcon
  ]

  const ColorizedShuffleOnIcon = useMemo(
    () =>
      colorize(IconShuffleOnLight, {
        // Arrow 2.Head.Fill 1
        'layers.0.shapes.0.it.2.c.k.0.s': neutral,
        // Arrow 2.Head.Fill 1
        'layers.0.shapes.0.it.2.c.k.0.e': primary,
        // Arrow 2.Tail.Stroke 1
        'layers.0.shapes.1.it.1.c.k.0.s': neutral,
        // Arrow 2.Tail.Stroke 1
        'layers.0.shapes.1.it.1.c.k.0.e': primary,
        // Arrow 1.Head.Fill 1
        'layers.1.shapes.0.it.2.c.k.0.s': neutral,
        // Arrow 1.Head.Fill 1
        'layers.1.shapes.0.it.2.c.k.0.e': primary,
        // Arrow 1.Tail.Stroke 1
        'layers.1.shapes.1.it.1.c.k.0.s': neutral,
        // Arrow 1.Tail.Stroke 1
        'layers.1.shapes.1.it.1.c.k.0.e': primary
      }),
    [neutral, primary]
  )

  const ColorizedShuffleOffIcon = useMemo(
    () =>
      colorize(IconShuffleOffLight, {
        // Arrow 2.Head.Fill 1
        'layers.0.shapes.0.it.2.c.k.0.s': primary,
        // Arrow 2.Head.Fill 1
        'layers.0.shapes.0.it.2.c.k.0.e': neutral,
        // Arrow 2.Tail.Stroke 1
        'layers.0.shapes.1.it.1.c.k.0.s': primary,
        // Arrow 2.Tail.Stroke 1
        'layers.0.shapes.1.it.1.c.k.0.e': neutral,
        // Arrow 1.Head.Fill 1
        'layers.1.shapes.0.it.2.c.k.0.s': primary,
        // Arrow 1.Head.Fill 1
        'layers.1.shapes.0.it.2.c.k.0.e': neutral,
        // Arrow 1.Tail.Stroke 1
        'layers.1.shapes.1.it.1.c.k.0.s': primary,
        // Arrow 1.Tail.Stroke 1
        'layers.1.shapes.1.it.1.c.k.0.e': neutral
      }),
    [neutral, primary]
  )

  const shuffleIconJSON = [ColorizedShuffleOnIcon, ColorizedShuffleOffIcon]

  const ColorizedPlayIcon = useMemo(
    () =>
      colorize(IconPlay, {
        // #playpause1.Group 1.Fill 1
        'layers.0.shapes.0.it.1.c.k': background,
        // #playpause2.Left.Fill 1
        'layers.1.shapes.0.it.1.c.k': background,
        // #playpause2.Right.Fill 1
        'layers.1.shapes.1.it.1.c.k': background,
        // #primaryBG.Group 2.Fill 1
        'layers.2.shapes.0.it.1.c.k': primary
      }),
    [background, primary]
  )

  const ColorizedPauseIcon = useMemo(
    () =>
      colorize(IconPause, {
        // #playpause1.Group 1.Fill 1
        'layers.0.shapes.0.it.1.c.k': background,
        // #playpause2.Left.Fill 1
        'layers.1.shapes.0.it.1.c.k': background,
        // #playpause2.Right.Fill 1
        'layers.1.shapes.1.it.1.c.k': background,
        // #primaryBG.Group 2.Fill 1
        'layers.2.shapes.0.it.1.c.k': primary
      }),
    [background, primary]
  )

  const playButtonIconJSON = [ColorizedPlayIcon, ColorizedPauseIcon]

  const renderRepeatButton = () => {
    return (
      <AnimatedButton
        iconJSON={repeatIconJSON}
        onPress={onPressRepeat}
        style={styles.button}
        wrapperStyle={styles.shuffleRepeatIcons}
      />
    )
  }
  const renderPreviousButton = () => {
    return (
      <IconButton
        onPress={onPrevious}
        icon={isPodcast ? IconPodcastBack : IconPrev}
        styles={{ root: styles.button, icon: styles.nextPrevIcons }}
      />
    )
  }
  const renderPlayButton = () => {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <AnimatedButton
          iconIndex={isPlaying ? 1 : 0}
          iconJSON={playButtonIconJSON}
          onPress={onPressPlayButton}
          onPressIn={handlePressInScale}
          onPressOut={handlePressOutScale}
          style={styles.button}
          wrapperStyle={styles.playIcon}
        />
      </Animated.View>
    )
  }
  const renderNextButton = () => {
    return (
      <IconButton
        onPress={onNext}
        icon={isPodcast ? IconPodcastForward : IconNext}
        styles={{ root: styles.button, icon: styles.nextPrevIcons }}
      />
    )
  }
  const renderShuffleButton = () => {
    return (
      <AnimatedButton
        iconJSON={shuffleIconJSON}
        onPress={onPressShuffle}
        style={styles.button}
        wrapperStyle={styles.shuffleRepeatIcons}
      />
    )
  }
  return (
    <View style={styles.container}>
      {renderRepeatButton()}
      {renderPreviousButton()}
      {renderPlayButton()}
      {renderNextButton()}
      {renderShuffleButton()}
    </View>
  )
}
