import { useCallback } from 'react'

import { SetOptional } from 'type-fest'

import { useNativeDrawer } from 'app/hooks/useDrawer'
import { Drawer as DrawerName } from 'app/store/drawers/slice'

import Drawer, { DrawerProps } from './Drawer'

type NativeDrawerProps = SetOptional<DrawerProps, 'isOpen' | 'onClose'> & {
  drawerName: DrawerName
}

export const NativeDrawer = (props: NativeDrawerProps) => {
  const { drawerName, onClose: onCloseProp, ...other } = props

  const { isOpen, onClose, onClosed } = useNativeDrawer(drawerName)

  const handleClose = useCallback(() => {
    onCloseProp?.()
    onClose()
  }, [onCloseProp, onClose])

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      onClosed={onClosed}
      {...other}
    />
  )
}
