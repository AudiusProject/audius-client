import { useCallback } from 'react'

import {
  Name,
  lineupSelectors,
  feedPageLineupActions as feedActions,
  feedPageSelectors,
  reachabilitySelectors
} from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'

import { Screen } from 'app/components/core'
import { Header } from 'app/components/header'
import { Lineup } from 'app/components/lineup'
import { OfflinePlaceholder } from 'app/components/offline-placeholder'
import { usePopToTopOnDrawerOpen } from 'app/hooks/usePopToTopOnDrawerOpen'
import { make, track } from 'app/services/analytics'

import { FeedFilterButton } from './FeedFilterButton'
const { getDiscoverFeedLineup } = feedPageSelectors
const { makeGetLineupMetadatas } = lineupSelectors
const { getIsReachable } = reachabilitySelectors

const getFeedLineup = makeGetLineupMetadatas(getDiscoverFeedLineup)

const messages = {
  header: 'Your Feed'
}

export const FeedScreen = () => {
  usePopToTopOnDrawerOpen()

  const dispatch = useDispatch()
  const isNotReachable = useSelector(getIsReachable) === false

  const loadMore = useCallback(
    (offset: number, limit: number, overwrite: boolean) => {
      dispatch(feedActions.fetchLineupMetadatas(offset, limit, overwrite))
      track(make({ eventName: Name.FEED_PAGINATE, offset, limit }))
    },
    [dispatch]
  )

  return (
    <Screen>
      <Header text={messages.header}>
        <FeedFilterButton />
      </Header>
      {isNotReachable ? (
        <OfflinePlaceholder />
      ) : (
        <Lineup
          isFeed
          pullToRefresh
          delineate
          selfLoad
          actions={feedActions}
          lineupSelector={getFeedLineup}
          loadMore={loadMore}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  )
}
