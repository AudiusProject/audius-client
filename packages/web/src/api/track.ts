import { ID } from '@audius/common'

import { apiClient } from 'services/audius-api-client'

import { createApi } from './createApi'

const trackApi = createApi({
  reducerPath: 'trackApi',
  endpoints: {
    async getTrackById(id: ID) {
      alert(`Fetching track - ${id}`)
      return {
        track: await apiClient.getTrack({ id })
      }
    }
  }
})

export const { useGetTrackById } = trackApi.hooks
export default trackApi.reducer
