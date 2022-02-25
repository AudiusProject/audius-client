import { AppState } from 'store/types'

const getBase = (state: AppState) => state.application.ui.editFolderModal

export const getIsOpen = (state: AppState) => {
  return getBase(state).isOpen
}

export const getFolderId = (state: AppState) => {
  return getBase(state).folderId
}
