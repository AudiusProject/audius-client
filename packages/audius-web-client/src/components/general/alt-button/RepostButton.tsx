import React, { useState, MouseEvent } from 'react'
import cn from 'classnames'

import styles from './RepostButton.module.css'

import repostDark from 'assets/img/iconRepostDark@2x.png'
import repostDarkAlt from 'assets/img/iconRepostDarkAlt@2x.png'
import repostDarkActive from 'assets/img/iconRepostDarkActive@2x.png'
import repostLight from 'assets/img/iconRepostLight@2x.png'
import repostLightAlt from 'assets/img/iconRepostLightAlt@2x.png'
import repostLightActive from 'assets/img/iconRepostLightActive@2x.png'

type RepostButtonProps = {
  isDarkMode: boolean
  onClick?: (e: MouseEvent) => void
  className?: string
  wrapperClassName?: string
  isActive?: boolean
  isDisabled?: boolean
  stopPropagation?: boolean
  iconMode?: boolean // should it behave as a static icon?
  altVariant?: boolean
}

const iconMap = {
  dark: {
    active: {
      regular: repostDarkActive,
      variant: repostDarkActive
    },
    inactive: {
      regular: repostDark,
      variant: repostDarkAlt
    }
  },
  light: {
    active: {
      regular: repostLightActive,
      variant: repostLightActive
    },
    inactive: {
      regular: repostLight,
      variant: repostLightAlt
    }
  }
}

const RepostButton = ({
  isDarkMode,
  className,
  wrapperClassName,
  onClick = () => {},
  isActive = false,
  isDisabled = false,
  stopPropagation = true,
  iconMode = false,
  altVariant = false
}: RepostButtonProps) => {
  const icon =
    iconMap[isDarkMode ? 'dark' : 'light'][isActive ? 'active' : 'inactive'][
      altVariant ? 'variant' : 'regular'
    ]
  const [isSpinning, setIsSpinning] = useState(false)
  const [isDepressed, setIsDepressed] = useState(false)

  return (
    <div
      className={cn({ [styles.depress]: isDepressed }, wrapperClassName)}
      onAnimationEnd={() => {
        setIsDepressed(false)
      }}
      onClick={e => {
        if (iconMode) return
        stopPropagation && e.stopPropagation()
        if (isDisabled) return
        setIsSpinning(true)
        setIsDepressed(true)
        onClick(e)
      }}
    >
      <div
        className={cn(styles.icon, { [styles.spin]: isSpinning }, className)}
        style={{
          backgroundImage: `url(${icon})`,
          opacity: isDisabled ? 0.5 : 1
        }}
        onAnimationEnd={() => {
          setIsSpinning(false)
        }}
      />
    </div>
  )
}

export default RepostButton
