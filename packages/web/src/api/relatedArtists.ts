import { apiClient } from 'services/audius-api-client'

import { createApi } from './createApi'

const relatedArtistsApi = createApi({
  reducerPath: 'relatedArtistsApi',
  endpoints: {
    getRelatedArtists: {
      fetch: async ({ artistId }) => ({
        users: await apiClient.getRelatedArtists({
          userId: artistId,
          limit: 50
        })
      })
    }
  }
})

export const { useGetRelatedArtists } = relatedArtistsApi.hooks
export default relatedArtistsApi.reducer
