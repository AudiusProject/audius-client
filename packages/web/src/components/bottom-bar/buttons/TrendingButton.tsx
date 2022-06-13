import { memo } from 'react'

import AnimatedBottomButton from './AnimatedBottomButton'
import { ButtonProps } from './types'

const TrendingButton = ({
  darkMode,
  onClick,
  isActive,
  isMatrixMode
}: ButtonProps) => {
  return (
    <AnimatedBottomButton
      uniqueKey='trending-button'
      isActive={isActive}
      darkMode={darkMode}
      isMatrix={isMatrixMode}
      onClick={onClick}
      iconLightJSON={() => require('assets/animations/iconTrendingLight.json')}
      iconDarkJSON={() => require('assets/animations/iconTrendingDark.json')}
    />
  )
}

export default memo(TrendingButton)
