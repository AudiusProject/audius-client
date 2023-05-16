import { Kind } from 'models'
import { createApi } from './createApi'

const trackApi = createApi({
  reducerPath: 'trackApi',
  endpoints: {
    getTrackById: {
      fetch: async ({ id }, { apiClient }) => {
        return {
          track: await apiClient.getTrack({ id })
        }
      },
      options: {
        idArgKey: 'id',
        kind: Kind.TRACKS,
        schemaKey: 'track'
      }
    },
    getTrackByHandleAndSlug: {
      fetch: async ({ handle, slug, currentUserId }, { apiClient }) => {
        return {
          track: await apiClient.getTrackByHandleAndSlug({
            handle,
            slug,
            currentUserId
          })
        }
      },
      options: {
        idArgKey: 'id',
        kind: Kind.TRACKS,
        schemaKey: 'track'
      }
    }
  }
})

export const { useGetTrackById, useGetTrackByHandleAndSlug } = trackApi.hooks
export default trackApi.reducer
