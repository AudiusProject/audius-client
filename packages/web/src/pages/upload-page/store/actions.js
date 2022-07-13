export const UPLOAD_TRACKS = 'UPLOAD/UPLOAD_TRACKS'
export const UPLOAD_TRACKS_REQUESTED = 'UPLOAD/UPLOAD_TRACKS_REQUESTED'
export const UPLOAD_TRACKS_SUCCEEDED = 'UPLOAD/UPLOAD_TRACKS_SUCCEEDED'
export const UPLOAD_TRACKS_FAILED = 'UPLOAD/UPLOAD_TRACKS_FAILED'
export const UPLOAD_SINGLE_TRACK_FAILED = 'UPLOAD/UPLOAD_SINGLE_TRACK_FAILED'

export const UPDATE_PERCENT = 'UPLOAD/UPDATE_PERCENT'
export const INCREMENT_PERCENT = 'UPLOAD/INCREMENT_PERCENT'
export const UPDATE_PROGRESS = 'UPLOAD/UPDATE_PROGRESS'
export const RESET = 'UPLOAD/RESET'
export const RESET_STATE = 'UPLOAD/RESET_STATE'
export const UNDO_RESET_STATE = 'UPLOAD/UNDO_RESET_STATE'
export const TOGGLE_MULTI_TRACK_NOTIFICATION =
  'UPLOAD/TOGGLE_MULTI_TRACK_NOTIFICATION'

// Errors
export const UPGRADE_TO_CREATOR_ERROR = 'UPLOAD/ERROR/UPGRADE_TO_CREATOR'
export const SINGLE_TRACK_UPLOAD_ERROR = 'UPLOAD/ERROR/SINGLE_TRACK_UPLOAD'
export const SINGLE_TRACK_UPLOAD_TIMEOUT_ERROR =
  'UPLOAD/ERROR/SINGLE_TRACK_UPLOAD_TIMEOUT'
export const MULTI_TRACK_UPLOAD_ERROR = 'UPLOAD/ERROR/MULTI_TRACK_UPLOAD'
export const MULTI_TRACK_TIMEOUT_ERROR = 'UPLOAD/ERROR/MULTI_TRACK_TIMEOUT'
export const COLLECTION_CREATOR_NODE_UPLOAD_ERROR =
  'UPLOAD/ERROR/COLLECTION_CREATOR_NODE_UPLOAD'
export const COLLECTION_CREATOR_NODE_TIMEOUT_ERROR =
  'UPLOAD/ERROR/COLLECTION_CREATOR_NODE_TIMEOU'
export const COLLECTION_ADD_TRACK_TO_CHAIN_ERROR =
  'UPLOAD/ERROR/COLLECTION_ADD_TRACK_TO_CHAIN'
export const COLLECTION_ASSOCIATE_TRACKS_ERROR =
  'UPLOAD/ERROR/COLLECTION_ASSOCIATE_TRACKS'
export const COLLECTION_CREATE_PLAYLIST_NO_ID_ERROR =
  'UPLOAD/ERROR/COLLECTION_CREATE_PLAYLIST_NO_ID'
export const COLLECTION_CREATE_PLAYLIST_ID_EXISTS_ERROR =
  'UPLOAD/ERROR/COLLECTION_CREATE_PLAYLIST_ID_EXISTS'
export const COLLECTION_POLL_PLAYLIST_TIMEOUT_ERROR =
  'UPLOAD/ERROR/COLLECTION_POLL_PLAYLIST_TIMEOUT'

export const uploadTracks = (tracks, metadata, uploadType, stems) => {
  return { type: UPLOAD_TRACKS, tracks, metadata, uploadType, stems }
}

export const uploadSingleTrackFailed = (index) => {
  return { type: UPLOAD_SINGLE_TRACK_FAILED, index }
}

export const uploadTracksRequested = (tracks, metadata, uploadType, stems) => {
  return {
    type: UPLOAD_TRACKS_REQUESTED,
    tracks,
    metadata,
    uploadType,
    stems
  }
}

export const uploadTracksSucceeded = (id, trackMetadatas) => {
  return { type: UPLOAD_TRACKS_SUCCEEDED, id, trackMetadatas }
}

export const uploadTrackFailed = () => {
  return { type: UPLOAD_TRACKS_FAILED }
}

export const updateProgress = (index, progress) => {
  return { type: UPDATE_PROGRESS, index, progress }
}

export const reset = () => {
  return { type: RESET }
}

// Actions used to reset the react state and then the store state of upload from external container
export const resetState = () => {
  return { type: RESET_STATE }
}
export const undoResetState = () => {
  return { type: UNDO_RESET_STATE }
}

export const toggleMultiTrackNotification = (open = false) => {
  return { type: TOGGLE_MULTI_TRACK_NOTIFICATION, open }
}

export const upgradeToCreatorError = (error) => ({
  type: UPGRADE_TO_CREATOR_ERROR,
  error
})

export const singleTrackUploadError = (error, phase, trackSizeBytes) => ({
  type: SINGLE_TRACK_UPLOAD_ERROR,
  trackSizeBytes,
  error,
  phase
})

export const singleTrackTimeoutError = () => ({
  type: SINGLE_TRACK_UPLOAD_TIMEOUT_ERROR
})

export const multiTrackUploadError = (error, phase, numTracks, isStem) => ({
  type: MULTI_TRACK_UPLOAD_ERROR,
  error,
  phase,
  numTracks,
  isStem
})

export const multiTrackTimeoutError = () => ({
  type: MULTI_TRACK_TIMEOUT_ERROR
})

export const creatorNodeUploadError = (error) => ({
  type: COLLECTION_CREATOR_NODE_UPLOAD_ERROR,
  error
})

export const creatorNodeTimeoutError = () => ({
  type: COLLECTION_CREATOR_NODE_TIMEOUT_ERROR
})

export const addTrackToChainError = (error) => ({
  type: COLLECTION_ADD_TRACK_TO_CHAIN_ERROR,
  error
})

export const associateTracksError = (error) => ({
  type: COLLECTION_ASSOCIATE_TRACKS_ERROR,
  error
})

export const createPlaylistErrorIDExists = (error) => ({
  type: COLLECTION_CREATE_PLAYLIST_ID_EXISTS_ERROR,
  error
})

export const createPlaylistErrorNoId = (error) => ({
  type: COLLECTION_CREATE_PLAYLIST_NO_ID_ERROR,
  error
})

export const createPlaylistPollingTimeout = () => ({
  type: COLLECTION_POLL_PLAYLIST_TIMEOUT_ERROR
})
