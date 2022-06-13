import { memo } from 'react'

import AnimatedBottomButton from './AnimatedBottomButton'
import { ButtonProps } from './types'

const ProfileButton = ({
  darkMode,
  onClick,
  isActive,
  isMatrixMode
}: ButtonProps) => {
  return (
    <AnimatedBottomButton
      uniqueKey='profile-button'
      isActive={isActive}
      darkMode={darkMode}
      isMatrix={isMatrixMode}
      onClick={onClick}
      iconLightJSON={() => require('assets/animations/iconProfileLight.json')}
      iconDarkJSON={() => require('assets/animations/iconProfileDark.json')}
    />
  )
}

export default memo(ProfileButton)
