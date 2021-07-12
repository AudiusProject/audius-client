import { createCustomAction } from 'typesafe-actions'

import { CID } from 'models/common/Identifiers'

import { Status, Track } from './reducer'

export const OPEN = 'SHARE_SOUND_TO_TIKTOK_MODAL/OPEN'
export const CLOSE = 'SHARE_SOUND_TO_TIKTOK_MODAL/CLOSE'
export const SHARE = 'SHARE_SOUND_TO_TIKTOK_MODAL/SHARE'
export const SET_STATUS = 'SHARE_SOUND_TO_TIKTOK_MODAL/SET_STATUS'
export const AUTHENTICATED = 'SHARE_SOUND_TO_TIKTOK_MODAL/AUTHENTICATED'
export const SET_IS_AUTHENTICATED =
  'SHARE_SOUND_TO_TIKTOK_MODAL/SET_IS_AUTHENTICATED'
export const UPLOAD = 'SHARE_SOUND_TO_TIKTOK_MODAL/UPLOAD'
export const UPLOAD_SUCCESS = 'SHARE_SOUND_TO_TIKTOK_MODAL/UPLOAD_SUCCESS'

export const open = createCustomAction(OPEN, (track: Track) => ({
  track
}))
export const close = createCustomAction(CLOSE, () => {})
export const share = createCustomAction(SHARE, (cid: CID) => ({
  cid
}))
export const setStatus = createCustomAction(SET_STATUS, (status: Status) => ({
  status
}))
export const authenticated = createCustomAction(AUTHENTICATED, () => {})
export const setIsAuthenticated = createCustomAction(
  SET_IS_AUTHENTICATED,
  () => {}
)
export const upload = createCustomAction(UPLOAD, () => {})
