import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type EditFolderModalState = {
  isOpen: boolean
  folderId: string | null
}

const initialState: EditFolderModalState = {
  isOpen: false,
  folderId: null
}

type OpenPayload = string

const slice = createSlice({
  name: 'application/ui/editFolderModal',
  initialState,
  reducers: {
    open: (state, action: PayloadAction<OpenPayload>) => {
      state.isOpen = true
      state.folderId = action.payload
    },
    close: state => {
      state.isOpen = false
      state.folderId = null
    }
  }
})

export const { open, close } = slice.actions

export default slice.reducer
