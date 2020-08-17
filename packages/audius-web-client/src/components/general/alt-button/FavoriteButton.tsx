import React, { useState, MouseEvent } from 'react'
import cn from 'classnames'

import styles from './FavoriteButton.module.css'

import heartDark from 'assets/img/iconHeartDark@2x.png'
import heartDarkAlt from 'assets/img/iconHeartDarkAlt@2x.png'
import heartDarkActive from 'assets/img/iconHeartDarkActive@2x.png'
import heartLight from 'assets/img/iconHeartLight@2x.png'
import heartLightAlt from 'assets/img/iconHeartLightAlt@2x.png'
import heartLightActive from 'assets/img/iconHeartLightActive@2x.png'

type FavoriteButtonProps = {
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
      regular: heartDarkActive,
      variant: heartDarkActive
    },
    inactive: {
      regular: heartDark,
      variant: heartDarkAlt
    }
  },
  light: {
    active: {
      regular: heartLightActive,
      variant: heartLightActive
    },
    inactive: {
      regular: heartLight,
      variant: heartLightAlt
    }
  }
}

const FavoriteButton = ({
  isDarkMode,
  className,
  wrapperClassName,
  onClick = () => {},
  isActive = false,
  isDisabled = false,
  stopPropagation = true,
  iconMode = false,
  altVariant = false
}: FavoriteButtonProps) => {
  const [xAnim, setXAnim] = useState(false)
  const [yAnim, setYAnim] = useState(false)

  const icon =
    iconMap[isDarkMode ? 'dark' : 'light'][isActive ? 'active' : 'inactive'][
      altVariant ? 'variant' : 'regular'
    ]

  return (
    <div
      className={cn({ [styles.scaleYHolder]: yAnim }, wrapperClassName)}
      onAnimationEnd={() => {
        setYAnim(false)
      }}
      onClick={e => {
        if (iconMode) return
        stopPropagation && e.stopPropagation()
        if (isDisabled) return
        setXAnim(true)
        setYAnim(true)
        onClick(e)
      }}
    >
      <div
        className={cn(
          styles.heart,
          { [styles.scaleXHolder]: xAnim },
          className
        )}
        style={{
          backgroundImage: `url(${icon})`,
          opacity: isDisabled ? 0.5 : 1
        }}
        onAnimationEnd={() => {
          setXAnim(false)
        }}
      />
    </div>
  )
}

export default FavoriteButton
