import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useSelector } from 'utils/reducer'
import { getModalVisibility, Modals, setVisibility } from './slice'

/**
 * Sets visibility for a modal
 */
export const useSetVisibility = () => {
  const dispatch = useDispatch()
  const setVisibilityFunc = useCallback(
    (modalName: Modals) => (isOpen: boolean) => {
      dispatch(setVisibility({ modal: modalName, visible: isOpen }))
    },
    [dispatch]
  )
  return setVisibilityFunc
}

/**
 * Gets the latest visibility for a modal
 */
export const useGetVisibility = (modalName: Modals) => {
  return useSelector(state => getModalVisibility(state, modalName))
}

/**
 * Convenience wrapper to return getter and setter for modals,
 * in the familiar form of useState
 */
export const useModalState = (
  modalName: Modals
): [boolean, (isOpen: boolean) => void] => {
  const isOpen = useGetVisibility(modalName)
  const setter = useSetVisibility()(modalName)
  return [isOpen, setter]
}
