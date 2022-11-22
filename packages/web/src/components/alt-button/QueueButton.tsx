import { useState, MouseEvent } from 'react'

import cn from 'classnames'

import heartActiveMatrix from 'assets/img/iconHeartActiveMatrix@2x.png'
import heartDark from 'assets/img/iconHeartDark@2x.png'
import heartDarkActive from 'assets/img/iconHeartDarkActive@2x.png'
import heartDarkAlt from 'assets/img/iconHeartDarkAlt@2x.png'
import heartInactiveMatrix from 'assets/img/iconHeartInactiveMatrix@2x.png'
import heartLight from 'assets/img/iconHeartLight@2x.png'
import heartLightActive from 'assets/img/iconHeartLightActive@2x.png'
import heartLightAlt from 'assets/img/iconHeartLightAlt@2x.png'

import styles from './QueueButton.module.css'

type QueueButtonProps = {
  isDarkMode: boolean
  isMatrixMode: boolean
  onClick?: (e: MouseEvent) => void
  className?: string
  wrapperClassName?: string
  isActive?: boolean
  isDisabled?: boolean
  isUnlisted?: boolean
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
  },
  matrix: {
    active: {
      regular: heartActiveMatrix,
      variant: heartActiveMatrix
    },
    inactive: {
      regular: heartInactiveMatrix,
      variant: heartInactiveMatrix
    }
  }
}

const QueueButton = ({
  isDarkMode,
  isMatrixMode,
  className,
  wrapperClassName,
  onClick = () => {},
  isActive = false,
  isDisabled = false,
  isUnlisted = false,
  stopPropagation = true,
  iconMode = false,
  altVariant = false
}: QueueButtonProps) => {

  const icon =
    iconMap[isMatrixMode ? 'matrix' : isDarkMode ? 'dark' : 'light'][
      isActive ? 'active' : 'inactive'
    ][altVariant ? 'variant' : 'regular']

  return (
    <div
      className={cn(
        {
          [styles.isHidden]: isUnlisted,
          [styles.isDisabled]: isDisabled
        },
        styles.heartWrapper,
        wrapperClassName
      )}
      onClick={(e) => {
        if (iconMode) return
        stopPropagation && e.stopPropagation()
        if (isDisabled) return
        onClick(e)
      }}
    >
      <div
        className={cn(
          styles.heart,
          className
        )}
        style={{
          backgroundImage: `url(${icon})`,
          opacity: isDisabled ? 0.5 : 1
        }}
      />
    </div>
  )
}

export default QueueButton
