import { CommonState } from 'store/commonStore'

export const getPlaylistId = (state: CommonState) =>
  state.ui.publishPlaylistConfirmationModal.playlistId
