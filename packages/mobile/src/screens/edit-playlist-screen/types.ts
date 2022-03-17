import { Nullable } from 'audius-client/src/common/utils/typeUtils'
import { getTracks } from 'common/store/ui/createPlaylistModal/selectors'

export type Image = {
  height?: number
  width?: number
  name?: string
  size?: number
  fileType?: string
  url: string
  file?: string
}

export type PlaylistValues = {
  playlist_name: string
  description: Nullable<string>
  cover_art: Image
  tracks: ReturnType<typeof getTracks>
}

export type UpdatedPlaylist = Omit<PlaylistValues, 'cover_art'> & {
  updatedCoverArt?: Image
}
