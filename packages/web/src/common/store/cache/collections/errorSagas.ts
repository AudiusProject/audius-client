import { collectionsActions } from '@audius/common'

import { createErrorSagas } from 'utils/errorSagas'

type CollectionErrors =
  | ReturnType<typeof collectionsActions.createPlaylistFailed>
  | ReturnType<typeof collectionsActions.editPlaylistFailed>
  | ReturnType<typeof collectionsActions.addTrackToPlaylistFailed>
  | ReturnType<typeof collectionsActions.removeTrackFromPlaylistFailed>
  | ReturnType<typeof collectionsActions.orderPlaylistFailed>
  | ReturnType<typeof collectionsActions.deletePlaylistFailed>
  | ReturnType<typeof collectionsActions.publishPlaylistFailed>

const errorSagas = createErrorSagas<CollectionErrors>({
  errorTypes: [
    collectionsActions.createPlaylistFailed.type,
    collectionsActions.editPlaylistFailed.type,
    collectionsActions.addTrackToPlaylistFailed.type,
    collectionsActions.removeTrackFromPlaylistFailed.type,
    collectionsActions.orderPlaylistFailed.type,
    collectionsActions.deletePlaylistFailed.type,
    collectionsActions.publishPlaylistFailed.type
  ],
  getShouldRedirect: () => false,
  getShouldReport: () => true,
  getAdditionalInfo: (action: CollectionErrors) => action.payload
})

export default errorSagas
