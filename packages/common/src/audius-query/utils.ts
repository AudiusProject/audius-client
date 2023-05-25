import { Kind } from 'models/Kind'
import { CommonState } from 'store/reducers'

import * as cacheSelectors from '../store/cache/selectors'

import { EntityMap } from './types'

export function capitalize(str: string) {
  return str.replace(str[0], str[0].toUpperCase())
}

export const getKeyFromFetchArgs = (fetchArgs: any) => {
  return JSON.stringify(fetchArgs)
}

export const selectCommonEntityMap = (
  state: CommonState,
  kind?: Kind
): EntityMap | null => {
  const entityMap: EntityMap = {
    users: cacheSelectors.getAllEntries(state, { kind: Kind.USERS })
  }
  if (kind === Kind.USERS) return entityMap
  entityMap.tracks = cacheSelectors.getAllEntries(state, { kind: Kind.TRACKS })
  if (kind === Kind.TRACKS) return entityMap
  entityMap.collections = cacheSelectors.getAllEntries(state, {
    kind: Kind.COLLECTIONS
  })
  return entityMap
}
