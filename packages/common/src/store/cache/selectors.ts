import { CommonState } from 'store/commonStore'
import { Uid } from 'utils/uid'

import { Collection } from '../../models/Collection'
import { ID, UID } from '../../models/Identifiers'
import { Kind } from '../../models/Kind'

import { CollectionsCacheState } from './collections/types'

/**
 * Selects from the cache and strips away cache-only fields.
 */
export function getEntry(
  state: CommonState,
  props: {
    kind: Kind.COLLECTIONS
    id?: ID | null
    uid?: UID | null
  }
): Collection | null
export function getEntry(
  state: CommonState,
  props: {
    kind: Kind
    id?: ID | null
    uid?: UID | null
  }
): Collection | null
export function getEntry(
  state: CommonState,
  props: {
    kind: Kind
    id?: ID | null
    uid?: UID | null
  }
) {
  if (props.id) {
    const entry = getCache(state, props).entries[props.id]
    return entry ? entry.metadata : null
  }
  if (props.uid) {
    const id = Uid.fromString(props.uid).id
    const entry = getCache(state, props).entries[id]
    return entry ? entry.metadata : null
  }
  return null
}

/**
 * Selects the timestamps from the cache.
 */
export const getEntryTimestamp = (
  state: CommonState,
  { kind, id }: { kind: Kind; id?: ID | string | null }
) => {
  if (kind && id) {
    const entries = getCache(state, { kind }).entries
    if (entries[id] !== undefined) return entries[id]._timestamp
  }
  return null
}

/**
 * Gets all cache entries and strips away cache-only fields.
 */
export function getAllEntries(
  state: CommonState,
  props: { kind: Kind.COLLECTIONS }
): { [id: string]: Collection }
export function getAllEntries(state: CommonState, props: { kind: Kind }) {
  const entries = getCache(state, props).entries
  return Object.keys(entries).reduce((acc, id) => {
    acc[id] = entries[id as unknown as number].metadata
    return acc
  }, {} as { [id: string]: Collection })
}

export function getCache(
  state: CommonState,
  props: { kind: Kind.COLLECTIONS }
): CollectionsCacheState
export function getCache(
  state: CommonState,
  props: { kind: Kind }
): CollectionsCacheState
export function getCache(state: CommonState, props: { kind: Kind }) {
  switch (props.kind) {
    case Kind.COLLECTIONS:
      return state.collections
    default:
      return state.collections
  }
}

export function getId(state: CommonState, props: { kind: Kind; uid: UID }) {
  switch (props.kind) {
    case Kind.COLLECTIONS: {
      return state.collections.uids[props.uid]
    }
    default: {
      return state.collections.uids[props.uid]
    }
  }
}
