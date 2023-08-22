import { useCallback } from 'react'

import {
  musicConfettiActions,
  musicConfettiSelectors,
  themeSelectors,
  Theme
} from '@audius/common'
import { useDispatch } from 'react-redux'

import { MusicConfetti } from 'components/background-animations/MusicConfetti'
import { useIsMobile } from 'utils/clientUtil'
import { useSelector } from 'utils/reducer'
import zIndex from 'utils/zIndex'

// Re-enable for easy debugging
// import useHotkeys from 'hooks/useHotkey'
// const { show } = musicConfettiActions

const { getTheme } = themeSelectors
const { hide } = musicConfettiActions
const { getIsVisible } = musicConfettiSelectors

const ConnectedMusicConfetti = () => {
  const dispatch = useDispatch()
  const onConfettiFinished = useCallback(() => {
    dispatch(hide())
  }, [dispatch])

  // Re-enable for easy debugging
  // useHotkeys({
  //   88: () => dispatch(show())
  // })

  const isVisible = useSelector(getIsVisible)
  const isMobile = useIsMobile()
  const theme = useSelector(getTheme)

  return isVisible ? (
    <MusicConfetti
      zIndex={zIndex.MUSIC_CONFETTI}
      onCompletion={onConfettiFinished}
      theme={theme || Theme.DEFAULT}
      isMobile={isMobile}
    />
  ) : null
}

export default ConnectedMusicConfetti
