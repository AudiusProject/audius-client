import { ID } from 'models/common/Identifiers'

export enum Status {
  SHARE_STARTED,
  SHARE_SUCCESS,
  SHARE_ERROR
}

export type Track = {
  cid: string
  id: ID
  title: string
  duration: number
}

export type ShareSoundToTikTokModalState = {
  isAuthenticated: boolean
  isOpen: boolean
  track?: Track
  status: Status | null
}

export type OpenPayload = {
  track: Track
}

export type SetStatusPayload = {
  status: Status | null
}

export type SharePayload = {
  cid: string
}
