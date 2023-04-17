import { ID, Kind } from '@audius/common'

import { apiClient } from 'services/audius-api-client'

import { createApi } from './createApi'

const trackApi = createApi({
  reducerPath: 'trackApi',
  kind: Kind.TRACKS,
  endpoints: {
    async getTrackById(id: ID) {
      return {
        track: await apiClient.getTrack({ id })
      }
    }
  }
})

export const { useGetTrackById } = trackApi.hooks
export default trackApi.reducer
