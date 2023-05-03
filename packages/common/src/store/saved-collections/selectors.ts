import { createSelector } from '@reduxjs/toolkit'

import { Collection } from '../../models/Collection'
import { AccountCollection } from '../account'
import { getAccountStatus } from '../account/selectors'
import { getCollections } from '../cache/collections/selectors'
import { CommonState } from '../commonStore'

const getAccountCollections = (state: CommonState) => state.account.collections
export const getSavedAlbumsState = (state: CommonState) =>
  state.savedCollections.albums
export const getSavedPlaylistsState = (state: CommonState) =>
  state.savedCollections.playlists

export const getAccountAlbums = createSelector(
  [getAccountCollections, getAccountStatus],
  (collections, status) => ({
    status,
    data: Object.values(collections).filter((c) => c.is_album)
  })
)

type GetAlbumsWithDetailsResult = {
  fetched: Collection[]
  unfetched: AccountCollection[]
}
export const getAlbumsWithDetails = createSelector(
  [getAccountAlbums, getCollections],
  (albums, collections) => {
    // TODO: Might want to read status, what happens for failed loads of parts of the collection?
    return albums.data.reduce<GetAlbumsWithDetailsResult>(
      (acc, cur) => {
        if (collections[cur.id]) {
          acc.fetched.push(collections[cur.id])
        } else {
          acc.unfetched.push(cur)
        }
        return acc
      },
      { fetched: [], unfetched: [] }
    )
  }
)

export const getAccountPlaylists = createSelector(
  [getAccountCollections, getAccountStatus],
  (collections, status) => ({
    status,
    data: Object.values(collections).filter((c) => !c.is_album)
  })
)
