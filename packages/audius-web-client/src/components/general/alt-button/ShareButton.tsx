import React, { MouseEvent } from 'react'
import cn from 'classnames'

import styles from './ShareButton.module.css'

import shareDark from 'assets/img/iconShareDark@2x.png'
import shareLight from 'assets/img/iconShareLight@2x.png'

type ShareButtonProps = {
  onClick: (e: MouseEvent) => void
  isDarkMode: boolean
  className?: string
  stopPropagation?: boolean
}

const iconMap = {
  dark: shareDark,
  light: shareLight
}

const ShareButton = ({
  onClick,
  isDarkMode,
  className,
  stopPropagation = true
}: ShareButtonProps) => {
  const icon = iconMap[isDarkMode ? 'dark' : 'light']

  return (
    <div
      className={cn(styles.icon, className)}
      style={{
        backgroundImage: `url(${icon})`
      }}
      onClick={e => {
        onClick(e)
        stopPropagation && e.stopPropagation()
      }}
    />
  )
}

export default ShareButton
