import { Collection } from '../../models/Collection'
import { ID } from '../../models/Identifiers'

type CollectionType = 'albums' | 'playlists'

export type FetchCollectionsPayload = {
  type: CollectionType
  ids: ID[]
}

export type FetchCollectionsSucceededPayload = {
  type: CollectionType
}

export type FetchCollectionsFailedPayload = {
  type: CollectionType
}

export type CollectionWithOwner = Collection & {
  ownerHandle: string
}
