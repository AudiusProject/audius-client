import { createCustomAction } from 'typesafe-actions'

import { ID, CID } from 'models/common/Identifiers'

export const OPEN = 'SHARE_SOUND_TO_TIKTOK_MODAL/OPEN'
export const CLOSE = 'SHARE_SOUND_TO_TIKTOK_MODAL/CLOSE'
export const SHARE = 'SHARE_SOUND_TO_TIKTOK_MODAL/SHARE'
export const DOWNLOAD_STARTED = 'SHARE_SOUND_TO_TIKTOK_MODAL/DOWNLOAD_STARTED'
export const AUTHENTICATED = 'SHARE_SOUND_TO_TIKTOK_MODAL/AUTHENTICATED'
export const SET_IS_AUTHENTICATED =
  'SHARE_SOUND_TO_TIKTOK_MODAL/SET_IS_AUTHENTICATED'
export const UPLOAD = 'SHARE_SOUND_TO_TIKTOK_MODAL/UPLOAD'
export const UPLOAD_SUCCESS = 'SHARE_SOUND_TO_TIKTOK_MODAL/UPLOAD_SUCCESS'

export const open = createCustomAction(
  OPEN,
  (trackId: ID, trackTitle: string, trackCid: string) => ({
    trackId,
    trackTitle,
    trackCid
  })
)
export const close = createCustomAction(CLOSE, () => {})
export const share = createCustomAction(SHARE, (trackId: ID, cid: CID) => ({
  trackId,
  cid
}))
export const downloadStarted = createCustomAction(DOWNLOAD_STARTED, () => {})
export const authenticated = createCustomAction(AUTHENTICATED, () => {})
export const setIsAuthenticated = createCustomAction(
  SET_IS_AUTHENTICATED,
  () => {}
)
export const upload = createCustomAction(UPLOAD, () => {})
export const uploadSuccess = createCustomAction(UPLOAD_SUCCESS, () => {})
