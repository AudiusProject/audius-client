import { useState, useEffect, useRef } from 'react'

import ShuffleButton from './ShuffleButton'

type ShuffleButtonProviderProps = {
  darkMode: boolean
  isMatrix: boolean
  onShuffleOn: () => void
  onShuffleOff: () => void
  isMobile: boolean
}

type AnimationStates = {
  pbIconShuffleOff: string
  pbIconShuffleOn: string
}

const ShuffleButtonProvider = ({
  darkMode,
  isMatrix,
  onShuffleOn,
  onShuffleOff,
  isMobile
}: ShuffleButtonProviderProps) => {
  const [animations, setAnimations] = useState<AnimationStates | null>(null)
  const defaultAnimations = useRef<AnimationStates | null>(null)
  const darkAnimations = useRef<AnimationStates | null>(null)
  const matrixAnimations = useRef<AnimationStates | null>(null)

  useEffect(() => {
    if (isMatrix) {
      if (!matrixAnimations.current) {
        const pbIconShuffleOff = require('assets/animations/pbIconShuffleOffMatrix.json')
        const pbIconShuffleOn = require('assets/animations/pbIconShuffleOnMatrix.json')
        matrixAnimations.current = {
          pbIconShuffleOff,
          pbIconShuffleOn
        }
      }
      setAnimations({ ...matrixAnimations.current })
    } else if (darkMode) {
      if (!darkAnimations.current) {
        const pbIconShuffleOff = require('assets/animations/pbIconShuffleOffDark.json')
        const pbIconShuffleOn = require('assets/animations/pbIconShuffleOnDark.json')
        darkAnimations.current = {
          pbIconShuffleOff,
          pbIconShuffleOn
        }
      }
      setAnimations({ ...darkAnimations.current })
    } else {
      if (!defaultAnimations.current) {
        const pbIconShuffleOff = require('assets/animations/pbIconShuffleOff.json')
        const pbIconShuffleOn = require('assets/animations/pbIconShuffleOn.json')
        defaultAnimations.current = {
          pbIconShuffleOff,
          pbIconShuffleOn
        }
      }
      setAnimations({ ...defaultAnimations.current })
    }
  }, [darkMode, setAnimations, isMatrix])

  return (
    animations && (
      <ShuffleButton
        animations={animations}
        shuffleOn={onShuffleOn}
        shuffleOff={onShuffleOff}
        isMobile={isMobile}
      />
    )
  )
}

export default ShuffleButtonProvider
