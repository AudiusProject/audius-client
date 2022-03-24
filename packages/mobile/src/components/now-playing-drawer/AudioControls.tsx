import { useCallback } from 'react'

import { getRepeat, getShuffle } from 'common/store/queue/selectors'
import { shuffle, repeat, next, previous } from 'common/store/queue/slice'
import { RepeatMode } from 'common/store/queue/types'
import { Animated, View, StyleSheet } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import IconPause from 'app/assets/animations/iconPause.json'
import IconPlay from 'app/assets/animations/iconPlay.json'
import IconRepeatAllDark from 'app/assets/animations/iconRepeatAllDark.json'
import IconRepeatAllLight from 'app/assets/animations/iconRepeatAllLight.json'
import IconRepeatOffDark from 'app/assets/animations/iconRepeatOffDark.json'
import IconRepeatOffLight from 'app/assets/animations/iconRepeatOffLight.json'
import IconRepeatSingleDark from 'app/assets/animations/iconRepeatSingleDark.json'
import IconRepeatSingleLight from 'app/assets/animations/iconRepeatSingleLight.json'
import IconShuffleOffDark from 'app/assets/animations/iconShuffleOffDark.json'
import IconShuffleOffLight from 'app/assets/animations/iconShuffleOffLight.json'
import IconShuffleOnDark from 'app/assets/animations/iconShuffleOnDark.json'
import IconShuffleOnLight from 'app/assets/animations/iconShuffleOnLight.json'
import IconNext from 'app/assets/images/iconNext.svg'
import IconPrev from 'app/assets/images/iconPrev.svg'
import { AnimatedButton, IconButton } from 'app/components/core'
import * as haptics from 'app/haptics'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { usePressScaleAnimation } from 'app/hooks/usePressScaleAnimation'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { useThemedStyles } from 'app/hooks/useThemedStyles'
import { pause, play } from 'app/store/audio/actions'
import { getPlaying } from 'app/store/audio/selectors'
import { ThemeColors } from 'app/utils/theme'

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
}

export const AudioControls = ({ onNext, onPrevious }: AudioControlsProps) => {
  const dispatch = useDispatch()
  const dispatchWeb = useDispatchWeb()

  const styles = useThemedStyles(createStyles)

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

  const onPressNext = useCallback(() => {
    onNext()
    dispatchWeb(next({ skip: true }))
  }, [onNext, dispatchWeb])

  const onPressPrevious = useCallback(() => {
    onPrevious()
    dispatchWeb(previous({}))
  }, [onPrevious, dispatchWeb])

  const renderRepeatButton = () => {
    return (
      <AnimatedButton
        iconLightJSON={[
          IconRepeatAllLight,
          IconRepeatSingleLight,
          IconRepeatOffLight
        ]}
        iconDarkJSON={[
          IconRepeatAllDark,
          IconRepeatSingleDark,
          IconRepeatOffDark
        ]}
        onPress={onPressRepeat}
        style={styles.button}
        wrapperStyle={styles.shuffleRepeatIcons}
      />
    )
  }
  const renderPreviousButton = () => {
    return (
      <IconButton
        onPress={onPressPrevious}
        icon={IconPrev}
        styles={{ root: styles.button, icon: styles.nextPrevIcons }}
      />
    )
  }
  const renderPlayButton = () => {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <AnimatedButton
          iconIndex={isPlaying ? 1 : 0}
          iconLightJSON={[IconPlay, IconPause]}
          iconDarkJSON={[IconPlay, IconPause]}
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
        onPress={onPressNext}
        icon={IconNext}
        styles={{ root: styles.button, icon: styles.nextPrevIcons }}
      />
    )
  }
  const renderShuffleButton = () => {
    return (
      <AnimatedButton
        iconLightJSON={[IconShuffleOnLight, IconShuffleOffLight]}
        iconDarkJSON={[IconShuffleOnDark, IconShuffleOffDark]}
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
