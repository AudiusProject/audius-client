import { playlistUpdatesEntityAdapter } from './playlistUpdatesSlice'

export const {
  selectById: selectPlaylistUpdateById,
  selectTotal: selectPlaylistUpdatesTotal
} = playlistUpdatesEntityAdapter.getSelectors()
