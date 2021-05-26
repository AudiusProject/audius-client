import { SmartCollectionVariant } from 'containers/smart-collection/types'

export type PlaylistIdentifier = {
  type: 'playlist'
  playlist_id: number
}

export type ExplorePlaylistIdentifier = {
  type: 'explore_playlist'
  playlist_id: SmartCollectionVariant
}

export type PlaylistLibraryIdentifier =
  | PlaylistIdentifier
  | ExplorePlaylistIdentifier

export type PlaylistLibraryFolder = {
  type: 'folder'
  name: string
  contents: (PlaylistLibraryFolder | PlaylistLibraryIdentifier)[]
}

export type PlaylistLibrary = {
  contents: (PlaylistLibraryFolder | PlaylistLibraryIdentifier)[]
}
