import { createModal } from '../modals/createModal'

export type LeavingAudiusModalState = {
  link: string
}

const leavingAudiusModal = createModal<LeavingAudiusModalState>({
  reducerPath: 'leavingAudiusModal',
  initialState: {
    isOpen: false,
    link: ''
  },
  sliceSelector: (state) => state.ui.modalsWithState
})

export const useLeavingAudiusModal = leavingAudiusModal.hook
export const leavingAudiusModalReducer = leavingAudiusModal.reducer
