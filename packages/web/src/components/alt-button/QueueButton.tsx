import { useState, MouseEvent } from 'react'

import cn from 'classnames'
import { IconIndent } from '@audius/stems'

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
      <IconIndent
        className={cn(
          className
        )}
        style={{
          opacity: isDisabled ? 0.5 : 1
        }}
      />
    </div>
  )
}

export default QueueButton
