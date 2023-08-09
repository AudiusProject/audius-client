import type { full } from '@audius/sdk'

import { createApi } from 'audius-query'
import { UserCollectionMetadata } from 'models/Collection'
import { Kind } from 'models/Kind'
import { makeActivity } from 'services/audius-api-client/ResponseAdapter'
import { APIActivityV2 } from 'services/audius-api-client/types'
import { reformatCollection } from 'store/cache/collections/utils/reformatCollection'
import { encodeHashId } from 'utils/hashIds'
import { removeNullable } from 'utils/typeUtils'

type GetLibraryAlbumsArgs = {
  userId: number
  offset: number
  limit: number
  query?: string
  sortMethod?: full.GetUserLibraryAlbumsSortMethodEnum
  sortDirection?: full.GetUserLibraryAlbumsSortDirectionEnum
}

export const libraryApi = createApi({
  reducerPath: 'libraryApi',
  endpoints: {
    getLibraryAlbums: {
      fetch: async (
        args: GetLibraryAlbumsArgs,
        { audiusSdk, audiusBackend }
      ) => {
        const {
          userId,
          offset,
          limit,
          query = '',
          sortMethod = 'added_date',
          sortDirection = 'desc'
        } = args
        const sdk = await audiusSdk()
        const { data, signature } =
          await audiusBackend.signDiscoveryNodeRequest()
        const { data: rawAlbums = [] } =
          await sdk.full.users.getUserLibraryAlbums({
            id: encodeHashId(userId),
            userId: encodeHashId(userId),
            offset,
            limit,
            query,
            sortMethod,
            sortDirection,
            type: 'all',
            encodedDataMessage: data,
            encodedDataSignature: signature
          })
        const albumsMetadata = rawAlbums
          .map((r: APIActivityV2) => makeActivity(r))
          .filter(removeNullable) as UserCollectionMetadata[]
        const albums = albumsMetadata.map((am) =>
          reformatCollection({
            collection: am,
            audiusBackendInstance: audiusBackend,
            omitUser: false
          })
        )
        return albums
      },
      options: {
        kind: Kind.COLLECTIONS,
        schemaKey: 'collections',
        idListArgKey: 'playlist_id'
      }
    }
  }
})
export const { useGetLibraryAlbums } = libraryApi.hooks
export const libraryApiReducer = libraryApi.reducer
