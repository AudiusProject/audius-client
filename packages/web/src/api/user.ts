import { apiClient } from 'services/audius-api-client'

import { createApi } from './createApi'

const userApi = createApi({
  reducerPath: 'userApi',
  endpoints: {
    getUserById: {
      fetch: async ({ id, currentUserId }) => {
        const apiUser = await apiClient.getUser({ userId: id, currentUserId })
        return {
          user: apiUser?.[0]
        }
      }
    }
  }
})

export const { useGetUserById } = userApi.hooks
export default userApi.reducer
