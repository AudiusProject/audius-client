import { useEffect, useMemo } from 'react'

import type { CommonState, UserCollection } from '@audius/common'
import { useProxySelector, collectionPageActions } from '@audius/common'
import { useDispatch } from 'react-redux'

import { getCollectionList } from 'app/screens/favorites-screen/selectors'
import { mostListenedCache } from 'app/services/most-listened-cache'

import { CollectionList } from '../collection-list'

const { fetchCollectionList } = collectionPageActions

export const FeedMostPlayedTile = () => {
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

  if (topPlays?.length === 0) return null
  return (
    <CollectionList
      listKey='most-played-albums'
      collection={(collections as UserCollection[]) ?? []}
    />
  )
}
