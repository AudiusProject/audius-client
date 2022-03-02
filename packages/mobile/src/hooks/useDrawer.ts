import { useCallback } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { getVisibility } from 'app/store/drawers/selectors'
import { Drawer, setVisibility } from 'app/store/drawers/slice'

/**
 * Hook to get and set the visibility of a drawer
 * @param drawer
 * @returns [isOpen, setIsOpen]
 *
 * Example:
 *
 * const [isOpen, setIsOpen] = useDrawer('EnablePushNotificationsReminder')
 */
export const useDrawer = (
  drawer: Drawer
): [boolean, (isVisible: boolean) => void, boolean | 'closing'] => {
  const dispatch = useDispatch()
  const isOpen = useSelector(getVisibility(drawer))
  const setIsOpen = (visible: boolean, closed?: boolean) => {
    let visibleStatus = visible ? true : ('closing' as const)
    if (closed) {
      visibleStatus = false
    }
    dispatch(setVisibility({ drawer, visible: visibleStatus }))
  }

  return [isOpen === true, setIsOpen, isOpen]
}

export const useNativeDrawer = (drawerName: Drawer) => {
  const dispatch = useDispatch()
  const visibleState = useSelector(getVisibility(drawerName))

  const isOpen = visibleState === true
  const onClose = useCallback(() => {
    dispatch(setVisibility({ drawer: drawerName, visible: 'closing' }))
  }, [dispatch, drawerName])

  const onClosed = useCallback(() => {
    dispatch(setVisibility({ drawer: drawerName, visible: false }))
  }, [dispatch, drawerName])

  return { isOpen, onClose, onClosed, visibleState }
}
