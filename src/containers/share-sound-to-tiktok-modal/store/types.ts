import { CID, ID } from 'models/common/Identifiers'

export enum Status {
  SHARE_STARTED,
  SHARE_SUCCESS,
  SHARE_ERROR,
  SHARE_UNINITIALIZED
}

export type Track = {
  cid: CID
  id: ID
  title: string
  duration: number
}

export type ShareSoundToTikTokModalState = {
  isAuthenticated: boolean
  track?: Track
  status: Status
}

export type RequestOpenPayload = {
  id: ID
}

export type OpenPayload = {
  track: Track
}

export type SetStatusPayload = {
  status: Status
}
