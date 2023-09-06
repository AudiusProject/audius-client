import { useCallback } from 'react'

import { FeedFilter, feedPageSelectors, modalsActions } from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'

import { ScreenHeaderButton } from 'app/components/core'
import { messages } from 'app/components/feed-filter-drawer'

const { getFeedFilter } = feedPageSelectors
const { setVisibility } = modalsActions

const messageMap = {
  [FeedFilter.ALL]: messages.filterAll,
  [FeedFilter.ORIGINAL]: messages.filterOriginal,
  [FeedFilter.REPOST]: messages.filterReposts
}

export const FeedFilterButton = () => {
  const feedFilter = useSelector(getFeedFilter)
  const dispatch = useDispatch()

  const handlePress = useCallback(() => {
    dispatch(setVisibility({ modal: 'FeedFilter', visible: true }))
  }, [dispatch])

  return (
    <ScreenHeaderButton onPress={handlePress} title={messageMap[feedFilter]} />
  )
}
