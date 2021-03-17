import React from 'react'
import Lineup from 'containers/lineup/Lineup'
import { LineupVariant } from 'containers/lineup/types'
import { getLineup } from './store/lineups/collections/selectors'

import { trendingPlaylistLineupActions } from './store/lineups/collections/actions'
import Page from 'components/general/Page'
import DesktopHeader from 'components/general/header/desktop/Header'
import MobilePageContainer from 'components/general/MobilePageContainer'
import { isMobile } from 'utils/clientUtil'
import styles from './TrendingPlaylistPage.module.css'
import { BASE_URL, TRENDING_PLAYLISTS_PAGE } from 'utils/route'
import { useLineupProps } from 'containers/lineup/hooks'
import { useMobileHeader } from 'components/general/header/mobile/hooks'

const messages = {
  trendingPlaylistTile: 'Trending Playlists',
  description: 'Trending Playlists on Audius'
}

/** Wraps useLineupProps to return trending playlist lineup props */
const useTrendingPlaylistLineup = (containerRef: HTMLElement) => {
  return useLineupProps({
    actions: trendingPlaylistLineupActions,
    getLineupSelector: getLineup,
    variant: LineupVariant.PLAYLIST,
    numPlaylistSkeletonRows: 5,
    scrollParent: containerRef
  })
}

type TrendingPlaylistPageProps = {
  containerRef: HTMLElement
}

const DesktopTrendingPlaylistPage = ({
  containerRef
}: TrendingPlaylistPageProps) => {
  const lineupProps = useTrendingPlaylistLineup(containerRef)

  const header = (
    <DesktopHeader primary={messages.trendingPlaylistTile} variant='main' />
  )

  return (
    <Page
      title={messages.trendingPlaylistTile}
      description={messages.description}
      size='large'
      header={header}
    >
      <Lineup {...lineupProps} />
    </Page>
  )
}

const MobileTrendingPlaylistPage = ({
  containerRef
}: TrendingPlaylistPageProps) => {
  const lineupProps = useTrendingPlaylistLineup(containerRef)

  useMobileHeader({ title: messages.trendingPlaylistTile })

  return (
    <MobilePageContainer
      title={messages.trendingPlaylistTile}
      description={messages.description}
      canonicalUrl={`${BASE_URL}${TRENDING_PLAYLISTS_PAGE}`}
      hasDefaultHeader
    >
      <div className={styles.mobileLineupContainer}>
        <Lineup {...lineupProps} />
      </div>
    </MobilePageContainer>
  )
}

const TrendingPlaylistPage = (props: TrendingPlaylistPageProps) => {
  const mobile = isMobile()
  return (
    <>
      {mobile ? (
        <MobileTrendingPlaylistPage {...props} />
      ) : (
        <DesktopTrendingPlaylistPage {...props} />
      )}
    </>
  )
}

export default TrendingPlaylistPage
