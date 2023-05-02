import { createSelector } from '@reduxjs/toolkit'

import { getAccountStatus } from '../account/selectors'
import { CommonState } from '../commonStore'

const getAccountCollections = (state: CommonState) => state.account.collections

export const getAccountAlbums = createSelector(
  [getAccountCollections, getAccountStatus],
  (collections, status) => ({
    status,
    data: Object.values(collections).filter((c) => c.is_album)
  })
)

export const getAccountPlaylists = createSelector(
  [getAccountCollections, getAccountStatus],
  (collections, status) => ({
    status,
    data: Object.values(collections).filter((c) => !c.is_album)
  })
)
