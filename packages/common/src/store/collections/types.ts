import { EntityState, PayloadAction } from '@reduxjs/toolkit'
import { Dictionary } from 'lodash'

import { Collection } from 'models/Collection'
import { ID, UID } from 'models/Identifiers'
import { SquareSizes } from 'models/ImageSizes'
import { Status } from 'models/Status'
import { Track } from 'models/Track'
import { User } from 'models/User'
import { Nullable } from 'utils/typeUtils'

export type CollectionsState = EntityState<Collection> & {
  timestamps: Dictionary<number>
  permalinks: Dictionary<ID>
  statuses: Dictionary<Status>
  uids: Dictionary<number>
}

export type AddCollectionsAction = PayloadAction<{
  collections: Collection[]
  uids: Dictionary<number>
}>

export type AddCollectionUidsAction = PayloadAction<{
  uids: Array<{ id: ID; uid: UID }>
}>

export type FetchCollectionCoverArtAction = PayloadAction<{
  id: ID
  size: SquareSizes
}>

export type CreatePlaylistAction = PayloadAction<{
  playlistId: ID
  formFields: Record<string, unknown>
  source: string
  initTrackId?: Nullable<number>
}>

type FailedAction = {
  error: Error
  params: Record<string, unknown>
  metadata: Record<string, unknown>
}

export type CreatePlaylistFailedAction = PayloadAction<FailedAction>

export type PublishPlaylistAction = PayloadAction<{
  playlistId: ID
}>

export type PublishPlaylistFailedAction = PayloadAction<FailedAction>

export type EditPlaylistAction = PayloadAction<{
  playlistId: ID
  formFields: Collection
}>

export type EditPlaylistFailedAction = PayloadAction<FailedAction>

export type OrderPlaylistAction = PayloadAction<{
  playlistId: ID
  trackIdsAndTimes: { id: ID; time: number }[]
  trackUids?: UID[]
}>

export type OrderPlaylistFailedAction = PayloadAction<FailedAction>

export type DeletePlaylistAction = PayloadAction<{
  playlistId: ID
}>

export type DeletePlaylistFailedAction = PayloadAction<FailedAction>

export type AddTrackToPlaylistAction = PayloadAction<{
  trackId: ID
  playlistId: ID
}>

export type AddTrackToPlaylistFailedAction = PayloadAction<FailedAction>

export type RemoveTrackFromPlaylistAction = PayloadAction<{
  trackId: ID
  playlistId: ID
  timestamp: number
}>

export type RemoveTrackFromPlaylistFailedAction = PayloadAction<FailedAction>

export type EnhancedCollectionTrack = Track & { user: User; uid: UID }

export enum PlaylistOperations {
  ADD_TRACK = 'ADD_TRACK',
  REMOVE_TRACK = 'REMOVE_TRACK',
  REORDER = 'REORDER'
}
