import { Kind } from 'models'

import { createApi } from './createApi'

const collectionApi = createApi({
  reducerPath: 'collectionApi',
  endpoints: {
    getPlaylistById: {
      fetch: async ({ playlistId, currentUserId }, { apiClient }) => {
        return {
          collection: (
            await apiClient.getPlaylist({
              playlistId,
              currentUserId
            })
          )[0]
        }
      },
      options: {
        idArgKey: 'playlistId',
        kind: Kind.COLLECTIONS,
        schemaKey: 'collection'
      }
    },
    // Note: Please do not use this endpoint yet as it depends on further changes on the DN side.
    getPlaylistByPermalink: {
      fetch: async ({ permalink, currentUserId }, { apiClient }) => {
        return {
          collection: (
            await apiClient.getPlaylistByPermalink({
              permalink,
              currentUserId
            })
          )[0]
        }
      },
      options: {
        permalinkArgKey: 'permalink',
        kind: Kind.COLLECTIONS,
        schemaKey: 'collection'
      }
    }
  }
})

export const { useGetPlaylistByPermalink, useGetPlaylistById } = collectionApi.hooks
export default collectionApi.reducer
