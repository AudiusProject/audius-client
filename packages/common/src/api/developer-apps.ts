import { z } from 'zod'

import { ID } from 'models/Identifiers'
import { createApi } from 'src/audius-query'
import { encodeHashId } from 'utils/hashIds'

const descriptionMaxLength = 128

export const developerAppSchema = z.object({
  userId: z.number(),
  name: z.string(),
  description: z.string().max(descriptionMaxLength).optional()
})

export type DeveloperApp = {
  name: string
  description?: string
  apiKey: string
  apiSecret?: string
}

type NewAppPayload = Omit<DeveloperApp, 'apiKey'> & {
  userId: number
}

type DeleteDeveloperAppArgs = {
  apiKey: string
  userId: number
}

const developerAppsApi = createApi({
  reducerPath: 'developerAppsApi',
  endpoints: {
    getDeveloperApps: {
      async fetch({ id }: { id: ID }, { audiusSdk }) {
        const encodedUserId = encodeHashId(id) as string
        const sdk = await audiusSdk()
        const { data = [] } = await sdk.users.getDeveloperApps({
          id: encodedUserId
        })

        return {
          apps: data.map(
            ({ address, name, description }): DeveloperApp => ({
              name,
              description,
              apiKey: address.slice(2)
            })
          )
        }
      },

      options: { idArgKey: 'id' }
    },
    addDeveloperApp: {
      async fetch(newApp: NewAppPayload, { audiusSdk }) {
        const { name, description, userId } = newApp
        const encodedUserId = encodeHashId(userId) as string
        const sdk = await audiusSdk()

        const { apiKey, apiSecret } =
          await sdk.developerApps.createDeveloperApp({
            name,
            description,
            userId: encodedUserId
          })

        return { name, description, apiKey, apiSecret }
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
        const { apiSecret: apiSecretIgnored, ...restNewApp } = newApp
        dispatch(
          developerAppsApi.util.updateQueryData(
            'getDeveloperApps',
            { id: userId },
            (state) => {
              state.apps.push(restNewApp)
            }
          )
        )
      }
    },
    deleteDeveloperApp: {
      async fetch(args: DeleteDeveloperAppArgs, { audiusSdk }) {
        const { userId, apiKey } = args
        const encodedUserId = encodeHashId(userId) as string
        const sdk = await audiusSdk()

        return await sdk.developerApps.deleteDeveloperApp({
          userId: encodedUserId,
          appApiKey: apiKey
        })
      },
      options: {
        type: 'mutation'
      },
      async onQuerySuccess(_response, args, { dispatch }) {
        const { userId, apiKey } = args
        dispatch(
          developerAppsApi.util.updateQueryData(
            'getDeveloperApps',
            { id: userId },
            (state) => {
              const appIndex = state.apps.findIndex(
                (app) => app.apiKey === apiKey
              )
              state.apps.splice(appIndex, 1)
            }
          )
        )
      }
    }
  }
})

export const {
  useGetDeveloperApps,
  useAddDeveloperApp,
  useDeleteDeveloperApp
} = developerAppsApi.hooks

export const developerAppsApiReducer = developerAppsApi.reducer
