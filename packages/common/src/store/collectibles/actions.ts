import { createCustomAction } from 'typesafe-actions'

import { Collectible, ID } from 'models'

export const ETH_COLLECTIBLES_FETCHED = 'COLLECTIBLES/ETH_COLLECTIBLES_FETCHED'
export const SOL_COLLECTIBLES_FETCHED = 'COLLECTIBLES/SOL_COLLECTIBLES_FETCHED'
export const UPDATE_USER_ETH_COLLECTIBLES =
  'COLLECTIBLES/UPDATE_USER_ETH_COLLECTIBLES'
export const UPDATE_USER_SOL_COLLECTIBLES =
  'COLLECTIBLES/UPDATE_USER_SOL_COLLECTIBLES'

export const ethCollectiblesFetched = createCustomAction(
  ETH_COLLECTIBLES_FETCHED,
  (userId: ID) => ({ userId })
)
export const solCollectiblesFetched = createCustomAction(
  SOL_COLLECTIBLES_FETCHED,
  (userId: ID) => ({ userId })
)
export const updateUserEthCollectibles = createCustomAction(
  UPDATE_USER_ETH_COLLECTIBLES,
  (userId: ID, userCollectibles: Collectible[]) => ({ userId, userCollectibles })
)
export const updateUserSolCollectibles = createCustomAction(
  UPDATE_USER_SOL_COLLECTIBLES,
  (userId: ID, userCollectibles: Collectible[]) => ({ userId, userCollectibles })
)
