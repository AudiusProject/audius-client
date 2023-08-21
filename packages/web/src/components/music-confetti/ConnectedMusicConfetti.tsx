import { useCallback } from 'react'

import { musicConfettiActions, musicConfettiSelectors } from '@audius/common'
import { useDispatch } from 'react-redux'

import { MusicConfetti } from 'components/background-animations/MusicConfetti'
import useHotkeys from 'hooks/useHotkey'
import { useIsMobile } from 'utils/clientUtil'
import { useSelector } from 'utils/reducer'
import { isMatrix } from 'utils/theme/theme'

const { hide, show } = musicConfettiActions
const { getIsVisible } = musicConfettiSelectors

const ConnectedMusicConfetti = () => {
  const dispatch = useDispatch()
  const onConfettiFinished = useCallback(() => {
    dispatch(hide())
  }, [dispatch])

  useHotkeys({
    88: () => dispatch(show())
  })
  const isVisible = useSelector(getIsVisible)
  const isMatrixMode = isMatrix()
  const isMobile = useIsMobile()

  return isVisible ? (
    <MusicConfetti
      zIndex={10000}
      onCompletion={onConfettiFinished}
      isMatrix={isMatrixMode}
      limit={isMatrixMode ? (isMobile ? 200 : 500) : undefined}
      gravity={isMatrixMode ? 0.25 : undefined}
    />
  ) : (
    <></>
  )
}

export default ConnectedMusicConfetti
