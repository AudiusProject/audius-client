import { z } from 'zod'

import { ID } from 'models/Identifiers'
import { createApi } from 'src/audius-query'
import { encodeHashId } from 'utils/hashIds'

const descriptionMaxLength = 28

export const developerAppSchema = z.object({
  userId: z.number(),
  name: z.string().min(5),
  description: z.string().max(descriptionMaxLength)
})

export type DeveloperApp = {
  name: string
  description: string
  apiKey: string
  apiSecret?: string
}

type NewAppPayload = Omit<DeveloperApp, 'apiKey'> & {
  userId: number
}

const mockApp1: DeveloperApp = {
  name: 'New Test App 1',
  description: 'New Test',
  apiKey: '021671c830081f1dc6277a739ddf3a72f1ae197dd7ed219e2341c36c73c90ce8c6'
}

const developerAppsApi = createApi({
  reducerPath: 'developerAppsApi',
  endpoints: {
    getDeveloperApps: {
      async fetch({ id: _id }: { id: ID }) {
        return { apps: [mockApp1] }
      },
      options: { idArgKey: 'id' }
    },
    addDeveloperAppMutation: {
      async fetch(newApp: NewAppPayload, { audiusSdk }) {
        const { name, description, userId } = newApp
        const encodedUserId = encodeHashId(userId) as string
        const sdk = await audiusSdk()
        return await sdk.developerApps.createDeveloperApp({
          name,
          description,
          userId: encodedUserId,
          isPersonalAccess: false
        })
      },
      options: {
        idArgKey: 'name',
        type: 'mutation'
      },
      async onQuerySuccess(
        newApp: DeveloperApp,
        newAppArgs: NewAppPayload,
        { dispatch }
      ) {
        const { userId } = newAppArgs
        dispatch(
          developerAppsApi.util.updateQueryData(
            'getDeveloperApps',
            { id: userId },
            (state) => {
              state.apps.push(newApp)
            }
          )
        )
      }
    }
  }
})

export const { useGetDeveloperApps, useAddDeveloperAppMutation } =
  developerAppsApi.hooks

export const developerAppsApiReducer = developerAppsApi.reducer
