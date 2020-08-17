import React from 'react'

import { DiscoverPageContentProps } from 'containers/discover-page/types'
import { LineupVariant } from 'containers/lineup/types'
import { feedActions } from 'containers/discover-page/store/lineups/feed/actions'
import FeedFilter from 'models/FeedFilter'
import Page from 'components/general/Page'
import Header from 'components/general/header/desktop/Header'
import FeedFilters from './FeedFilters'
import { animated } from 'react-spring'
import { Spring } from 'react-spring/renderprops'
import Lineup from 'containers/lineup/Lineup'
import EndOfLineup from 'containers/lineup/EndOfLineup'
import EmptyFeed from 'containers/discover-page/components/EmptyFeed'
import { make, useRecord } from 'store/analytics/actions'
import { Name } from 'services/analytics'

import baseStyles from './DiscoverPageContent.module.css'
import {
  getLoadMoreTrackCount,
  INITIAL_LOAD_TRACKS_MULTIPLIER
} from 'containers/lineup/LineupProvider'

const initialFilters = [FeedFilter.ALL, FeedFilter.ORIGINAL, FeedFilter.REPOST]

const messages = {
  feedHeaderTitle: 'Your Feed'
}

const FeedPageContent = ({
  feedTitle,
  feedDescription,
  feedIsMain,
  feed,
  fetchSuggestedFollowUsers,
  followUsers,
  suggestedFollows,
  hasAccount,
  goToTrending,
  goToSignUp,
  setFeedInView,
  loadMoreFeed,
  playFeedTrack,
  pauseFeedTrack,
  getLineupProps,
  feedFilter,
  setFeedFilter,
  resetFeedLineup
}: DiscoverPageContentProps) => {
  const mainLineupProps = {
    variant: LineupVariant.MAIN
  }

  const feedLineupProps = {
    ...getLineupProps(feed),
    setInView: setFeedInView,
    loadMore: loadMoreFeed,
    playTrack: playFeedTrack,
    pauseTrack: pauseFeedTrack,
    delineate: feedIsMain,
    actions: feedActions
  }
  const record = useRecord()

  const didSelectFilter = (filter: FeedFilter) => {
    if (feedLineupProps.scrollParent && feedLineupProps.scrollParent.scrollTo) {
      feedLineupProps.scrollParent.scrollTo(0, 0)
    }
    setFeedFilter(filter)
    resetFeedLineup()
    const fetchLimit = getLoadMoreTrackCount(
      mainLineupProps.variant,
      INITIAL_LOAD_TRACKS_MULTIPLIER
    )
    const fetchOffset = 0
    loadMoreFeed(fetchOffset, fetchLimit, true)
    record(make(Name.FEED_CHANGE_VIEW, { view: filter }))
  }

  const header = (
    <Header
      primary={messages.feedHeaderTitle}
      variant={'main'}
      rightDecorator={
        <FeedFilters
          initialFilters={initialFilters}
          filter={feedFilter}
          didSelectFilter={didSelectFilter}
        />
      }
    />
  )

  return (
    <>
      <Page
        title={feedTitle}
        description={feedDescription}
        size='large'
        header={header}
      >
        <div className={baseStyles.mainLineup}>
          <Spring
            key={'main-feed'}
            from={{ opacity: 0.2 }}
            to={{ opacity: 1 }}
            config={{ duration: 200 }}
          >
            {style => (
              <animated.div style={style}>
                <Lineup
                  emptyElement={
                    <EmptyFeed
                      hasAccount={hasAccount}
                      fetchFollowUsers={fetchSuggestedFollowUsers}
                      followUsers={followUsers}
                      suggestedFollows={suggestedFollows}
                      onClick={hasAccount ? goToTrending : goToSignUp}
                    />
                  }
                  endOfLineup={<EndOfLineup key='endOfLineup' />}
                  key='feed'
                  {...feedLineupProps}
                  {...mainLineupProps}
                />
              </animated.div>
            )}
          </Spring>
        </div>
      </Page>
    </>
  )
}

export default FeedPageContent
