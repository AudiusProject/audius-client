import { Dictionary, EntityState, PayloadAction } from '@reduxjs/toolkit'

import { ID, UID } from 'models/Identifiers'
import { SquareSizes } from 'models/ImageSizes'
import { Status } from 'models/Status'
import { Track } from 'models/Track'

export type AddTracksAction = PayloadAction<{
  tracks: Track[]
  uids: Dictionary<number>
}>

export type AddUidsAction = PayloadAction<{
  uids: Array<{ id: ID; uid: UID }>
}>

export type TracksState = EntityState<Track> & {
  timestamps: Dictionary<number>
  permalinks: Dictionary<ID>
  statuses: Dictionary<Status>
  uids: Dictionary<number>
}

export type EditTrackAction = PayloadAction<{
  trackId: ID
  formFields: Record<string, unknown>
}>

export type DeleteTrackAction = PayloadAction<{ trackId: ID }>
export type DeleteTrackSucceededAction = PayloadAction<{ trackId: ID }>
export type FetchCoverArtAction = PayloadAction<{
  id: ID
  size: SquareSizes
}>
export type CheckIsDownloadableAction = PayloadAction<{ trackId: ID }>
