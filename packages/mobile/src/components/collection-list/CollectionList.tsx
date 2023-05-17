import { createElement, useCallback, useMemo } from 'react'

import type { Collection, ID, UserCollection } from '@audius/common'

import type { CardListProps } from 'app/components/core'
import { CardList } from 'app/components/core'

import { CollectionCard } from './CollectionCard'
import { CollectionCardSkeleton } from './CollectionCardSkeleton'

type FullListProps = Omit<CardListProps<UserCollection>, 'data' | 'renderItem'>
type IDCardListItem = {
  id: ID
}
type IDListProps = Omit<CardListProps<IDCardListItem>, 'data' | 'renderItem'>

type FullCollectionListProps = {
  collection?: Collection[]
  /** Optional mapping of collection ids to the number that should be shown as the # of tracks in the collection's info card. Added this because im offline mode, the number of tracks downloaded may not yet match the actual number of tracks in the collection. */
  collectionIdsToNumTracks?: Record<number, number>
} & FullListProps

type CollectionIdListProps = {
  collectionIds: ID[]
} & IDListProps

type CollectionListProps = FullCollectionListProps | CollectionIdListProps

const FullCollectionList = (props: FullCollectionListProps) => {
  const { collection, collectionIdsToNumTracks, ...other } = props
  const renderCard = useCallback(
    ({ item }: { item: Collection }) => (
      <CollectionCard
        collection={item}
        numTracks={collectionIdsToNumTracks?.[item.playlist_id] ?? undefined}
      />
    ),
    [collectionIdsToNumTracks]
  )

  return (
    <CardList
      data={collection}
      renderItem={renderCard}
      LoadingCardComponent={CollectionCardSkeleton}
      {...other}
    />
  )
}

function isIdListProps(
  props: CollectionListProps
): props is CollectionIdListProps {
  return (props as CollectionIdListProps).collectionIds !== undefined
}

const CollectionIDList = (props: CollectionIdListProps) => {
  const { collectionIds, ...other } = props
  const renderCard = useCallback(
    ({ item }: { item: IDCardListItem }) => (
      <CollectionCard collectionId={item.id} />
    ),
    []
  )

  const idList: IDCardListItem[] = useMemo(
    () => collectionIds.map((id) => ({ id })),
    [collectionIds]
  )

  return (
    <CardList
      data={idList}
      renderItem={renderCard}
      LoadingCardComponent={CollectionCardSkeleton}
      {...other}
    />
  )
}

// Helper to switch between legacy version and newer version of CollectionList.
// The latter just takes IDs and allows the child components to fetch their data
export const CollectionList = (props: CollectionListProps) => {
  return isIdListProps(props)
    ? createElement(CollectionIDList, props)
    : createElement(FullCollectionList, props)
}
