import { PayloadAction } from '@reduxjs/toolkit'

import { ShareSource } from 'common/models/Analytics'
import { Collection } from 'common/models/Collection'
import { ID } from 'common/models/Identifiers'
import { Track } from 'common/models/Track'
import { User } from 'common/models/User'
import { Nullable } from 'common/utils/typeUtils'

export type ShareType = 'track' | 'profile' | 'album' | 'playlist'

type ShareTrackContent = {
  type: 'track'
  track: Track
  artist: User
}

type ShareProfileContent = {
  type: 'profile'
  profile: User
}

type ShareAlbumContent = {
  type: 'album'
  album: Collection
  artist: User
}

type SharePlaylistContent = {
  type: 'playlist'
  playlist: Collection
  creator: User
}

export type ShareModalContent =
  | ShareTrackContent
  | ShareProfileContent
  | ShareAlbumContent
  | SharePlaylistContent

export type ShareModalState = {
  source: Nullable<ShareSource>
  content: Nullable<ShareModalContent>
}

type RequestOpenPayload = { source: ShareSource } & (
  | { type: 'track'; trackId: ID }
  | { type: 'profile'; profileId: ID }
  | { type: 'collection'; collectionId: ID }
)

export type RequestOpenAction = PayloadAction<RequestOpenPayload>

type OpenPayload = { source: ShareSource } & (
  | ShareTrackContent
  | ShareProfileContent
  | ShareAlbumContent
  | SharePlaylistContent
)

export type OpenAction = PayloadAction<OpenPayload>
