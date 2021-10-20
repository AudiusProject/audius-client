import React, { useCallback, useEffect } from 'react'

import { Modal } from '@audius/stems'
import { useDispatch, useSelector } from 'react-redux'

import { ChangePassword } from './ChangePassword'
import { getCurrentPage } from './store/selectors'
import { changePage, Page } from './store/slice'

const messages = {
  title: '🔒 Change Password'
}

export const ChangePasswordModal = (props: any) => {
  const { showModal, onClose } = props

  const dispatch = useDispatch()

  const currentPage = useSelector(getCurrentPage)
  const allowClose = [
    Page.CONFIRM_CREDENTIALS,
    Page.FAILURE,
    Page.SUCCESS
  ].includes(currentPage)

  useEffect(() => {
    if (showModal) {
      dispatch(changePage(Page.CONFIRM_CREDENTIALS))
    }
  }, [dispatch, showModal])

  return (
    <Modal
      title={messages.title}
      showTitleHeader
      showDismissButton={allowClose}
      dismissOnClickOutside={allowClose}
      isOpen={showModal}
      onClose={onClose}
    >
      <ChangePassword onComplete={onClose} />
    </Modal>
  )
}
