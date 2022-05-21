import { EntityType } from 'audius-client/src/common/store/notifications/types'

import { getCollectionRoute, getTrackRoute } from 'app/utils/routes'

export const getEntityRoute = (entity: EntityType, fullUrl = false) => {
  if ('track_id' in entity) {
    return getTrackRoute(entity, fullUrl)
  }
  return getCollectionRoute(entity, fullUrl)
}
