import { Action } from '@reduxjs/toolkit'

import { User } from 'models/User'

import { createModal } from '../modals/createModal'

export type InboxUnavailableModalState = {
  user?: User
  presetMessage?: string
  onCancelAction?: Action
  onSuccessAction?: Action
}

const inboxUnavailableModal = createModal<InboxUnavailableModalState>({
  initialState: {
    isOpen: false
  },
  reducerPath: 'inboxUnavailableModal',
  sliceSelector: (state) => state.ui.modalsWithState
})

export const {
  hook: useInboxUnavailableModal,
  actions: inboxUnavailableModalActions,
  reducer: inboxUnavailableModalReducer
} = inboxUnavailableModal
