import { useState, Suspense, ReactNode, useEffect } from 'react'

import {
  ID,
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

const StatTile = (props: { title: string; value: any }) => {
  return (
    <div className={styles.statTileContainer}>
      <span className={styles.statValue}>{formatCount(props.value)}</span>
      <span className={styles.statTitle}>{props.title}</span>
    </div>
  )
}

export const messages = {
  thisYear: 'This Year'
}

export const ArtistDashboardPage = () => {
  const [selectedTrack, setSelectedTrack] = useState(-1)
  const goToRoute = useGoToRoute()
  const dispatch = useDispatch()
  const header = <Header primary='Dashboard' />
  const isUSDCEnabled = getFeatureEnabled(FeatureFlags.USDC_PURCHASES)

  const { account, tracks, unlistedTracks, stats } = useSelector(
    makeGetDashboard()
  )
  const listenData = useSelector(getDashboardListenData)
  const status = useSelector(getDashboardStatus)
  const isMatrix = useSelector(getTheme) === Theme.MATRIX

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

  const onClickRow = (record: any) => {
    if (!account) return
    goToRoute(record.permalink)
  }

  const onSetTrackOption = (trackId: ID) => {
    setSelectedTrack(trackId)
  }

  const onSetYearOption = (year: string) => {
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
  }

  const renderCreatorContent = () => {
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
              onSetTrackOption={onSetTrackOption}
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
  }

  const renderProfileSection = () => {
    if (!account) return null

    return (
      <div className={styles.profileContainer}>
        <ArtistProfile
          userId={account.user_id}
          profilePictureSizes={account._profile_picture_sizes}
          isVerified={account.is_verified}
          name={account.name}
          handle={account.handle}
          onViewProfile={() => goToRoute(profilePage(account.handle))}
        />
      </div>
    )
  }

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
          {renderProfileSection()}
          {isUSDCEnabled ? <USDCTile balance={0} /> : null}
          {renderCreatorContent()}
        </>
      )}
    </Page>
  )
}
