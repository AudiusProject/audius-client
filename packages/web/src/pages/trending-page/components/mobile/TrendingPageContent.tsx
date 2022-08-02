import { useCallback, useContext, useEffect, useMemo } from 'react'

import { Name, Status, TimeRange } from '@audius/common'
import cn from 'classnames'

import { ReactComponent as IconAllTime } from 'assets/img/iconAllTime.svg'
import { ReactComponent as IconDay } from 'assets/img/iconDay.svg'
import { ReactComponent as IconMonth } from 'assets/img/iconMonth.svg'
import {
  trendingAllTimeActions,
  trendingMonthActions,
  trendingWeekActions
} from 'common/store/pages/trending/lineup/actions'
import Header from 'components/header/mobile/Header'
import { HeaderContext } from 'components/header/mobile/HeaderContextProvider'
import { EndOfLineup } from 'components/lineup/EndOfLineup'
import Lineup from 'components/lineup/Lineup'
import { LineupVariant } from 'components/lineup/types'
import MobilePageContainer from 'components/mobile-page-container/MobilePageContainer'
import NavContext, {
  CenterPreset,
  LeftPreset,
  RightPreset
} from 'components/nav/store/context'
import PullToRefresh from 'components/pull-to-refresh/PullToRefresh'
import useAsyncPoll from 'hooks/useAsyncPoll'
import useTabs from 'hooks/useTabs/useTabs'
import { TrendingPageContentProps } from 'pages/trending-page/types'
import { make, useRecord } from 'store/analytics/actions'
import { BASE_URL, TRENDING_PAGE } from 'utils/route'
import { scrollWindowToTop } from 'utils/scroll'

import RewardsBanner from '../RewardsBanner'

import TrendingFilterButton from './TrendingFilterButton'
import styles from './TrendingPageContent.module.css'

const messages = {
  title: 'Trending',
  thisWeek: 'THIS WEEK',
  thisMonth: 'THIS MONTH',
  allTime: 'ALL TIME',
  endOfLineupDescription: "Looks like you've reached the end of this list..."
}

const RANK_ICON_COUNT = 5

const tabHeaders = [
  { icon: <IconDay />, text: messages.thisWeek, label: TimeRange.WEEK },
  { icon: <IconMonth />, text: messages.thisMonth, label: TimeRange.MONTH },
  { icon: <IconAllTime />, text: messages.allTime, label: TimeRange.ALL_TIME }
]

const TrendingPageMobileContent = ({
  trendingTitle,
  trendingDescription,

  trendingTimeRange,
  setTrendingTimeRange,
  makeRefreshTrendingInView,

  getLineupProps,
  makePauseTrack,
  makeLoadMore,
  makePlayTrack,
  trendingWeek,
  trendingMonth,
  trendingAllTime,
  makeSetInView,
  getLineupForRange,
  trendingGenre,
  goToGenreSelection
}: TrendingPageContentProps) => {
  // Set Nav-Bar Menu
  const { setLeft, setCenter, setRight } = useContext(NavContext)!
  useEffect(() => {
    setLeft(LeftPreset.NOTIFICATION)
    setRight(RightPreset.SEARCH)
    setCenter(CenterPreset.LOGO)
  }, [setLeft, setCenter, setRight])

  const getStatus = (timeRange: TimeRange) => {
    const lineup = getLineupForRange(timeRange)
    if (!lineup) return Status.SUCCESS
    return lineup.lineup.status
  }

  const [weekStatus, monthStatus, allTimeStatus] = [
    getStatus(TimeRange.WEEK),
    getStatus(TimeRange.MONTH),
    getStatus(TimeRange.ALL_TIME)
  ]

  // Setup pull to refresh
  const refreshTrendingWeek = useCallback(
    () => makeRefreshTrendingInView(TimeRange.WEEK)(true),
    [makeRefreshTrendingInView]
  )
  const refreshTrendingMonth = useCallback(
    () => makeRefreshTrendingInView(TimeRange.MONTH)(true),
    [makeRefreshTrendingInView]
  )
  const refreshTrendingAllTime = useCallback(
    () => makeRefreshTrendingInView(TimeRange.ALL_TIME)(true),
    [makeRefreshTrendingInView]
  )

  const asyncRefresh = {
    [TimeRange.WEEK]: useAsyncPoll({
      call: refreshTrendingWeek,
      variable: weekStatus,
      value: Status.SUCCESS
    }),
    [TimeRange.MONTH]: useAsyncPoll({
      call: refreshTrendingMonth,
      variable: monthStatus,
      value: Status.SUCCESS
    }),
    [TimeRange.ALL_TIME]: useAsyncPoll({
      call: refreshTrendingAllTime,
      variable: allTimeStatus,
      value: Status.SUCCESS
    })
  }

  // Setup lineups
  const weekProps = useMemo(
    () => getLineupProps(trendingWeek),
    [getLineupProps, trendingWeek]
  )
  const monthProps = useMemo(
    () => getLineupProps(trendingMonth),
    [getLineupProps, trendingMonth]
  )
  const allTimeProps = useMemo(
    () => getLineupProps(trendingAllTime),
    [getLineupProps, trendingAllTime]
  )

  const lineups = useMemo(() => {
    return [
      <>
        {trendingGenre === null ? (
          <div className={styles.rewardsContainer}>
            <RewardsBanner bannerType='tracks' />
          </div>
        ) : null}
        <Lineup
          key='trendingWeek'
          {...weekProps}
          setInView={makeSetInView(TimeRange.WEEK)}
          loadMore={makeLoadMore(TimeRange.WEEK)}
          playTrack={makePlayTrack(TimeRange.WEEK)}
          pauseTrack={makePauseTrack(TimeRange.WEEK)}
          actions={trendingWeekActions}
          variant={LineupVariant.MAIN}
          isTrending
          rankIconCount={trendingGenre === null ? RANK_ICON_COUNT : undefined}
          endOfLineup={
            <EndOfLineup
              key='endOfLineup'
              description={messages.endOfLineupDescription}
            />
          }
        />
      </>,
      <Lineup
        key='trendingMonth'
        {...monthProps}
        setInView={makeSetInView(TimeRange.MONTH)}
        loadMore={makeLoadMore(TimeRange.MONTH)}
        playTrack={makePlayTrack(TimeRange.MONTH)}
        pauseTrack={makePauseTrack(TimeRange.MONTH)}
        actions={trendingMonthActions}
        variant={LineupVariant.MAIN}
        isTrending
        endOfLineup={
          <EndOfLineup
            key='endOfLineup'
            description={messages.endOfLineupDescription}
          />
        }
      />,
      <Lineup
        key='trendingAllTime'
        {...allTimeProps}
        setInView={makeSetInView(TimeRange.ALL_TIME)}
        loadMore={makeLoadMore(TimeRange.ALL_TIME)}
        playTrack={makePlayTrack(TimeRange.ALL_TIME)}
        pauseTrack={makePauseTrack(TimeRange.ALL_TIME)}
        actions={trendingAllTimeActions}
        variant={LineupVariant.MAIN}
        isTrending
        endOfLineup={
          <EndOfLineup
            key='endOfLineup'
            description={messages.endOfLineupDescription}
          />
        }
      />
    ]
  }, [
    makeLoadMore,
    makePauseTrack,
    makePlayTrack,
    makeSetInView,
    monthProps,
    weekProps,
    allTimeProps,
    trendingGenre
  ])
  const record = useRecord()

  const didChangeTabs = useCallback(
    (from: string, to: string) => {
      if (from === to) return
      setTrendingTimeRange(to as TimeRange)

      // Fo the mobile layout scroll the document element, not the lineup container
      scrollWindowToTop()

      // Manually setInView
      makeSetInView(to as TimeRange)(true)
      makeSetInView(from as TimeRange)(false)
      if (from !== to)
        record(
          make(Name.TRENDING_CHANGE_VIEW, {
            timeframe: to as TimeRange,
            genre: trendingGenre || ''
          })
        )
    },
    [setTrendingTimeRange, makeSetInView, record, trendingGenre]
  )

  const memoizedElements = useMemo(() => {
    return lineups.map((lineup, i) => (
      <div key={i} className={cn(styles.lineupContainer)}>
        {lineup}
      </div>
    ))
  }, [lineups])

  const { tabs, body } = useTabs({
    tabs: tabHeaders,
    elements: memoizedElements,
    initialTab: trendingTimeRange,
    selectedTabLabel: trendingTimeRange,
    didChangeTabsFrom: didChangeTabs
  })

  const { setHeader } = useContext(HeaderContext)
  useEffect(() => {
    setHeader(
      <>
        <Header title={messages.title} className={styles.header}>
          <TrendingFilterButton
            selectedGenre={trendingGenre}
            onClick={goToGenreSelection}
          />
        </Header>
        <div className={styles.tabBarHolder}>{tabs}</div>
      </>
    )
  }, [setHeader, trendingGenre, goToGenreSelection, tabs])

  return (
    <MobilePageContainer
      title={trendingTitle}
      description={trendingDescription}
      canonicalUrl={`${BASE_URL}${TRENDING_PAGE}`}
    >
      <div className={styles.tabsContainer}>
        <div className={styles.tabBodyHolder}>
          <PullToRefresh fetchContent={asyncRefresh[trendingTimeRange]}>
            {body}
          </PullToRefresh>
        </div>
      </div>
    </MobilePageContainer>
  )
}

export default TrendingPageMobileContent
