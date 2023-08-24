import type { full } from '@audius/sdk'

import { AudiusQueryContextType, createApi } from 'audius-query'
import { UserCollectionMetadata } from 'models/Collection'
import { Kind } from 'models/Kind'
import { makeActivity } from 'services/audius-api-client/ResponseAdapter'
import { APIActivityV2 } from 'services/audius-api-client/types'
import { encodeHashId } from 'utils/hashIds'
import { removeNullable } from 'utils/typeUtils'

type GetLibraryItemsArgs = {
  userId: number
  offset: number
  limit: number
  query?: string
  sortMethod?: full.GetUserLibraryAlbumsSortMethodEnum
  sortDirection?: full.GetUserLibraryAlbumsSortDirectionEnum
}
const COLLECTIONS_CACHE_OPTIONS = {
  kind: Kind.COLLECTIONS,
  schemaKey: 'collections'
}

const fetchLibraryCollections = async ({
  args,
  context,
  collectionType
}: {
  args: GetLibraryItemsArgs
  context: AudiusQueryContextType
  collectionType: 'album' | 'playlist'
}) => {
  const { audiusSdk, audiusBackend } = context
  const {
    userId,
    offset,
    limit,
    query = '',
    sortMethod = 'added_date',
    sortDirection = 'desc'
  } = args
  const sdk = await audiusSdk()
  const { data, signature } = await audiusBackend.signDiscoveryNodeRequest()

  const getCollectionsParams = {
    id: encodeHashId(userId),
    userId: encodeHashId(userId),
    offset,
    limit,
    query,
    sortMethod,
    sortDirection,
    type: 'all' as full.GetUserLibraryAlbumsTypeEnum,
    encodedDataMessage: data,
    encodedDataSignature: signature
  }
  const { data: rawCollections = [] } =
    collectionType === 'album'
      ? await sdk.full.users.getUserLibraryAlbums(getCollectionsParams)
      : await sdk.full.users.getUserLibraryPlaylists(getCollectionsParams)
  const collections = rawCollections
    .map((r: APIActivityV2) => makeActivity(r))
    .filter(removeNullable) as UserCollectionMetadata[]
  return collections
}

export const libraryApi = createApi({
  reducerPath: 'libraryApi',
  endpoints: {
    getLibraryPlaylists: {
      fetch: async (args: GetLibraryItemsArgs, context) => {
        const playlists = await fetchLibraryCollections({
          args,
          context,
          collectionType: 'playlist'
        })
        return playlists
      },
      options: COLLECTIONS_CACHE_OPTIONS
    },
    getLibraryAlbums: {
      fetch: async (args: GetLibraryItemsArgs, context) => {
        const albums = await fetchLibraryCollections({
          args,
          context,
          collectionType: 'album'
        })
        return albums
      },
      options: COLLECTIONS_CACHE_OPTIONS
    }
  }
})
export const { useGetLibraryAlbums, useGetLibraryPlaylists } = libraryApi.hooks
export const libraryApiReducer = libraryApi.reducer
