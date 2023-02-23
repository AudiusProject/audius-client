import { useCallback } from 'react'

import type { Toast } from '@audius/common'
import { uuid, toastActions } from '@audius/common'
import { useDispatch } from 'react-redux'

const { addToast } = toastActions

type ToastAction = Omit<Toast, 'key'>

export const useToast = () => {
  const dispatch = useDispatch()
  const handleToast = useCallback(
    (toast: ToastAction) => {
      dispatch(addToast({ ...toast, key: uuid() }))
    },
    [dispatch]
  )

  return { toast: handleToast }
}
