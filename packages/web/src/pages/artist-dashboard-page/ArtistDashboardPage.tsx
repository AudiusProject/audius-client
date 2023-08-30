import { useState, Suspense, ReactNode, useEffect, useCallback } from 'react'

import {
  Status,
  Theme,
  Track,
  formatCount,
  themeSelectors,
  FeatureFlags
} from '@audius/common'
import cn from 'classnames'
import { each } from 'lodash'
import moment, { Moment } from 'moment'
import { useDispatch, useSelector } from 'react-redux'

import Header from 'components/header/desktop/Header'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import Page from 'components/page/Page'
import { useGoToRoute } from 'hooks/useGoToRoute'
import { getFeatureEnabled } from 'services/remote-config/featureFlagHelpers'
import lazyWithPreload from 'utils/lazyWithPreload'
import { profilePage, TRENDING_PAGE } from 'utils/route'

import styles from './ArtistDashboardPage.module.css'
import ArtistProfile from './components/ArtistProfile'
import {
  TracksTableContainer,
  DataSourceTrack,
  tablePageSize
} from './components/TracksTableContainer'
import { USDCTile } from './components/USDCTile'
import {
  fetchDashboard,
  fetchDashboardListenData,
  resetDashboard
} from './store/actions'
import {
  getDashboardListenData,
  getDashboardStatus,
  makeGetDashboard
} from './store/selectors'
const { getTheme } = themeSelectors

const TotalPlaysChart = lazyWithPreload(
  () => import('./components/TotalPlaysChart')
)

export const messages = {
  thisYear: 'This Year'
}

const formatMetadata = (trackMetadatas: Track[]): DataSourceTrack[] => {
  return trackMetadatas
    .map((metadata, i) => ({
      ...metadata,
      key: `${metadata.title}_${metadata.dateListened}_${i}`,
      name: metadata.title,
      date: metadata.created_at,
      time: metadata.duration,
      saves: metadata.save_count,
      reposts: metadata.repost_count,
      plays: metadata.play_count
    }))
    .filter((meta) => !meta.is_invalid)
}

const StatTile = (props: { title: string; value: any }) => {
  return (
    <div className={styles.statTileContainer}>
      <span className={styles.statValue}>{formatCount(props.value)}</span>
      <span className={styles.statTitle}>{props.title}</span>
    </div>
  )
}

export const ArtistDashboardPage = () => {
  const goToRoute = useGoToRoute()
  const dispatch = useDispatch()
  const isUSDCEnabled = getFeatureEnabled(FeatureFlags.USDC_PURCHASES)
  const [selectedTrack, setSelectedTrack] = useState(-1)
  const { account, tracks, unlistedTracks, stats } = useSelector(
    makeGetDashboard()
  )
  const listenData = useSelector(getDashboardListenData)
  const status = useSelector(getDashboardStatus)
  const isMatrix = useSelector(getTheme) === Theme.MATRIX

  const header = <Header primary='Dashboard' />

  useEffect(() => {
    dispatch(fetchDashboard(0, tablePageSize))
    TotalPlaysChart.preload()
    return () => {
      dispatch(resetDashboard())
    }
  }, [dispatch])

  useEffect(() => {
    if (account) {
      const { track_count = 0 } = account
      if (!(track_count > 0)) {
        goToRoute(TRENDING_PAGE)
      }
    }
  }, [account, goToRoute])

  const onClickRow = useCallback(
    (record: any) => {
      if (!account) return
      goToRoute(record.permalink)
    },
    [account, goToRoute]
  )

  const onSetYearOption = useCallback(
    (year: string) => {
      let start: Moment
      let end: Moment
      if (year === messages.thisYear) {
        const now = moment()
        start = now.clone().subtract(1, 'years')
        end = now
      } else {
        start = moment('01/01/' + year)
        end = start.clone().add(1, 'year')
      }
      dispatch(
        fetchDashboardListenData(
          tracks.map((t) => t.track_id),
          start.toISOString(),
          end.toISOString()
        )
      )
    },
    [dispatch, tracks]
  )

  const renderCreatorContent = useCallback(() => {
    const trackCount = account?.track_count || 0
    if (!account || !(trackCount > 0)) return null

    const statTiles: ReactNode[] = []
    each(stats, (stat, title) =>
      statTiles.push(<StatTile key={title} title={title} value={stat} />)
    )

    const chartData =
      selectedTrack === -1 ? listenData.all : listenData[selectedTrack]

    const chartTracks = tracks.map((track: any) => ({
      id: track.track_id,
      name: track.title
    }))

    const listedDataSource = formatMetadata(tracks)
    const unlistedDataSource = formatMetadata(unlistedTracks)
    return (
      <>
        <div className={styles.sectionContainer}>
          <Suspense fallback={<div className={styles.chartFallback} />}>
            <TotalPlaysChart
              data={chartData}
              isMatrix={isMatrix}
              tracks={chartTracks}
              selectedTrack={selectedTrack}
              onSetYearOption={onSetYearOption}
              onSetTrackOption={setSelectedTrack}
              accountCreatedAt={account.created_at}
            />
          </Suspense>
        </div>
        <div className={cn(styles.sectionContainer, styles.statsContainer)}>
          {statTiles}
        </div>
        <div className={styles.tracksTableWrapper}>
          <TracksTableContainer
            onClickRow={onClickRow}
            listedDataSource={listedDataSource}
            unlistedDataSource={unlistedDataSource}
            account={account}
          />
        </div>
      </>
    )
  }, [
    account,
    isMatrix,
    listenData,
    onClickRow,
    onSetYearOption,
    selectedTrack,
    stats,
    tracks,
    unlistedTracks
  ])

  return (
    <Page
      title='Dashboard'
      description='View important stats like plays, reposts, and more.'
      contentClassName={styles.pageContainer}
      header={header}
    >
      {!account || status === Status.LOADING ? (
        <LoadingSpinner className={styles.spinner} />
      ) : (
        <>
          <ArtistProfile
            userId={account.user_id}
            profilePictureSizes={account._profile_picture_sizes}
            isVerified={account.is_verified}
            name={account.name}
            handle={account.handle}
            onViewProfile={() => goToRoute(profilePage(account.handle))}
          />
          {isUSDCEnabled ? <USDCTile balance={0} /> : null}
          {renderCreatorContent()}
        </>
      )}
    </Page>
  )
}
