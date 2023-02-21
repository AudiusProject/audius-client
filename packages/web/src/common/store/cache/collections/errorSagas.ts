import { cacheCollectionsActions } from '@audius/common'

import { createErrorSagas } from 'utils/errorSagas'

type CollectionErrors =
  | ReturnType<typeof cacheCollectionsActions.createPlaylistFailed>
  | ReturnType<typeof cacheCollectionsActions.editPlaylistFailed>
  | ReturnType<typeof cacheCollectionsActions.addTrackToPlaylistFailed>
  | ReturnType<typeof cacheCollectionsActions.removeTrackFromPlaylistFailed>
  | ReturnType<typeof cacheCollectionsActions.orderPlaylistFailed>
  | ReturnType<typeof cacheCollectionsActions.deletePlaylistFailed>
  | ReturnType<typeof cacheCollectionsActions.publishPlaylistFailed>

const errorSagas = createErrorSagas<CollectionErrors>({
  errorTypes: [
    cacheCollectionsActions.createPlaylistFailed.type,
    cacheCollectionsActions.editPlaylistFailed.type,
    cacheCollectionsActions.addTrackToPlaylistFailed.type,
    cacheCollectionsActions.removeTrackFromPlaylistFailed.type,
    cacheCollectionsActions.orderPlaylistFailed.type,
    cacheCollectionsActions.deletePlaylistFailed.type,
    cacheCollectionsActions.publishPlaylistFailed.type
  ],
  getShouldRedirect: () => false,
  getShouldReport: () => true,
  getAdditionalInfo: (action: CollectionErrors) => action.payload
})

export default errorSagas
