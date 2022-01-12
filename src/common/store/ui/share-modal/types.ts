import { PayloadAction } from '@reduxjs/toolkit'

import { ShareSource } from 'common/models/Analytics'
import { Collection } from 'common/models/Collection'
import { ID } from 'common/models/Identifiers'
import { Track } from 'common/models/Track'
import { User } from 'common/models/User'
import { Nullable } from 'common/utils/typeUtils'

export type ShareType = 'track' | 'profile' | 'album'

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

export type ShareModalState = {
  source: Nullable<ShareSource>
  content: Nullable<ShareTrackContent | ShareProfileContent | ShareAlbumContent>
}

type RequestOpenPayload = { source: ShareSource } & (
  | { type: 'track'; trackId: ID }
  | { type: 'profile'; profileId: ID }
  | { type: 'album'; albumId: ID }
)

export type RequestOpenAction = PayloadAction<RequestOpenPayload>

type OpenPayload = { source: ShareSource } & (
  | ShareTrackContent
  | ShareProfileContent
  | ShareAlbumContent
)

export type OpenAction = PayloadAction<OpenPayload>
