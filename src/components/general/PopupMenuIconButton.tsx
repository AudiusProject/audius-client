import React from 'react'

import cn from 'classnames'

import {
  PopupMenu,
  PopupMenuProps,
  popupMenuClass
} from 'components/general/PopupMenu'

import IconButton from 'components/general/IconButton'
import styles from './PopupMenuIconButton.module.css'

type PopupMenuIconButtonProps = {
  icon?: React.ReactNode | Element
  iconClassName?: string
} & Omit<PopupMenuProps, 'renderTrigger'>

export const PopupMenuIconButton = (props: PopupMenuIconButtonProps) => {
  const { icon, iconClassName, ...popupMenuProps } = props

  return (
    <PopupMenu
      {...popupMenuProps}
      renderTrigger={(ref, triggerPopup) => (
        <IconButton
          ref={ref}
          className={cn(styles.icon, popupMenuClass, iconClassName)}
          icon={icon}
          disabled={props.disabled}
          onClick={triggerPopup}
        />
      )}
    />
  )
}
