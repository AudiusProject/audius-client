import { useEffect, useMemo } from 'react'

import type { CommonState, UserCollection } from '@audius/common'
import { useProxySelector, collectionPageActions } from '@audius/common'
import { useDispatch } from 'react-redux'

import { getCollectionList } from 'app/screens/favorites-screen/selectors'
import {
  mostListenedCache,
  MOST_LISTENED_CACHE_TOP_N_LIMIT
} from 'app/services/most-played-cache'

import { CollectionList } from '../collection-list'

import { FeedMostPlayedSkeleton } from './FeedMostPlayedSkeleton'

const { fetchCollectionList } = collectionPageActions

export const FeedMostPlayed = () => {
  const dispatch = useDispatch()

  const topPlays = useMemo(() => {
    return mostListenedCache.getMostListenedCollections()
  }, [])

  useEffect(() => {
    dispatch(fetchCollectionList(topPlays))
  }, [dispatch, topPlays])

  const collections = useProxySelector(
    (state: CommonState) => getCollectionList(state, topPlays),
    [topPlays]
  )

  // TODO: fallback to favorited collections or similar if there are no top plays
  return collections.length === 0 ? (
    <FeedMostPlayedSkeleton
      length={topPlays?.length ?? MOST_LISTENED_CACHE_TOP_N_LIMIT}
    />
  ) : (
    <CollectionList
      listKey='most-played-albums'
      collection={(collections as UserCollection[]) ?? []}
    />
  )
}
