import React, { useContext, useEffect, useMemo, ReactNode } from 'react'
import Spin from 'antd/lib/spin'

import useTabs from 'hooks/useTabs/useTabs'
import User from 'models/User'
import {
  UserCollection,
  SmartCollection,
  Variant as CollectionVariant
} from 'models/Collection'
import {
  Tabs as ExploreTabs,
  ExploreCollectionsVariant
} from 'containers/explore-page/store/types'
import { Status } from 'store/types'
import {
  playlistPage,
  albumPage,
  profilePage,
  BASE_URL,
  EXPLORE_PAGE
} from 'utils/route'

import MobilePageContainer from 'components/general/MobilePageContainer'
import Header from 'components/general/header/mobile/Header'
import Card from 'components/card/mobile/Card'
import ColorTile from './ColorTile'
import CardLineup from 'containers/lineup/CardLineup'
import { useMainPageHeader } from 'containers/nav/store/context'

import { ReactComponent as IconForYou } from 'assets/img/iconExploreMobileForYou.svg'
import { ReactComponent as IconMoods } from 'assets/img/iconExploreMobileMoods.svg'
import { ReactComponent as IconNote } from 'assets/img/iconNote.svg'
import { ReactComponent as IconUser } from 'assets/img/iconUser.svg'
import styles from './ExplorePage.module.css'
import { HeaderContext } from 'components/general/header/mobile/HeaderContextProvider'
import {
  HEAVY_ROTATION,
  BEST_NEW_RELEASES,
  UNDER_THE_RADAR,
  MOST_LOVED,
  FEELING_LUCKY
} from 'containers/smart-collection/smartCollections'
import {
  LET_THEM_DJ,
  TOP_ALBUMS,
  TOP_PLAYLISTS,
  CHILL_PLAYLISTS,
  UPBEAT_PLAYLISTS,
  INTENSE_PLAYLISTS,
  PROVOKING_PLAYLISTS,
  INTIMATE_PLAYLISTS,
  ExploreCollection,
  ExploreMoodCollection
} from 'containers/explore-page/collections'

const messages = {
  pageName: 'Explore',
  pageDescription: 'Explore featured content on Audius',
  forYou: 'For You',
  moods: 'Moods',
  playlists: 'Playlists',
  artists: 'Artists',
  featuredPlaylists: 'Featured Playlists',
  featuredArtists: 'Featured Artists',
  justForYou: 'Just For You',
  justForYouDescription: `Content curated for
you based on your likes, reposts, and follows. Refreshes often so if you like a track, favorite it.`,
  moodPlaylists: 'Playlists to Fit Your Mood',
  moodPlaylistsDescription:
    'Playlists made by Audius users, sorted by mood and feel.'
}

const justForYou = [
  HEAVY_ROTATION,
  LET_THEM_DJ,
  BEST_NEW_RELEASES,
  UNDER_THE_RADAR,
  TOP_ALBUMS,
  TOP_PLAYLISTS,
  MOST_LOVED,
  FEELING_LUCKY
]

const lifestyle = [
  CHILL_PLAYLISTS,
  UPBEAT_PLAYLISTS,
  INTENSE_PLAYLISTS,
  PROVOKING_PLAYLISTS,
  INTIMATE_PLAYLISTS
]

const TabBodyHeader = ({
  title,
  description,
  children
}: {
  title: string
  description?: string
  children?: ReactNode
}) => {
  return (
    <div className={styles.tabBodyHeader}>
      <div className={styles.headerWrapper}>
        <div className={styles.title}>{title}</div>
        {description && <div className={styles.description}>{description}</div>}
      </div>
      {children && <div className={styles.children}>{children}</div>}
    </div>
  )
}

const tabHeaders = [
  { icon: <IconForYou />, text: messages.forYou, label: ExploreTabs.FOR_YOU },
  { icon: <IconMoods />, text: messages.moods, label: ExploreTabs.MOODS },
  {
    icon: <IconNote />,
    text: messages.playlists,
    label: ExploreTabs.PLAYLISTS
  },
  { icon: <IconUser />, text: messages.artists, label: ExploreTabs.PROFILES }
]

export type ExplorePageProps = {
  title: string
  description: string
  playlists: UserCollection[]
  profiles: User[]
  status: Status
  formatPlaylistCardSecondaryText: (saves: number, tracks: number) => string
  formatProfileCardSecondaryText: (followerCount: number) => string
  goToRoute: (route: string) => void
}

const ExplorePage = ({
  title,
  description,
  playlists,
  profiles,
  status,
  formatPlaylistCardSecondaryText,
  formatProfileCardSecondaryText,
  goToRoute
}: ExplorePageProps) => {
  useMainPageHeader()

  const justForYouTiles = justForYou.map(
    (t: SmartCollection | ExploreCollection) => {
      const Icon = t.icon ? t.icon : React.Fragment
      if (t.variant === CollectionVariant.SMART) {
        return (
          <ColorTile
            key={t.playlist_name}
            title={t.playlist_name}
            link={t.link}
            description={t.description}
            gradient={t.gradient}
            shadow={t.shadow}
            // @ts-ignore
            icon={<Icon />}
            goToRoute={goToRoute}
          />
        )
      } else {
        return (
          <ColorTile
            key={t.title}
            title={t.title}
            link={t.link}
            description={t.subtitle}
            gradient={t.gradient}
            shadow={t.shadow}
            // @ts-ignore
            icon={<Icon />}
            goToRoute={goToRoute}
          />
        )
      }
    }
  )

  const lifestyleTiles = lifestyle.map((t: ExploreMoodCollection) => {
    return (
      <ColorTile
        key={t.title}
        title={t.title}
        link={t.link}
        description={t.subtitle}
        gradient={t.gradient}
        shadow={t.shadow}
        emoji={
          t.variant === ExploreCollectionsVariant.MOOD ? t.emoji : undefined
        }
        goToRoute={goToRoute}
      />
    )
  })

  let playlistCards: JSX.Element[]
  let profileCards: JSX.Element[]
  if (status === Status.LOADING) {
    playlistCards = []
    profileCards = []
  } else {
    playlistCards = playlists.map((playlist: UserCollection) => {
      return (
        <Card
          key={playlist.playlist_id}
          id={playlist.playlist_id}
          imageSize={playlist._cover_art_sizes}
          primaryText={playlist.playlist_name}
          secondaryText={formatPlaylistCardSecondaryText(
            playlist.save_count,
            playlist.playlist_contents.track_ids.length
          )}
          onClick={() =>
            playlist.is_album
              ? goToRoute(
                  albumPage(
                    playlist.user.handle,
                    playlist.playlist_name,
                    playlist.playlist_id
                  )
                )
              : goToRoute(
                  playlistPage(
                    playlist.user.handle,
                    playlist.playlist_name,
                    playlist.playlist_id
                  )
                )
          }
        />
      )
    })
    profileCards = profiles.map((profile: User) => {
      return (
        <Card
          key={profile.user_id}
          id={profile.user_id}
          imageSize={profile._profile_picture_sizes}
          isUser
          isVerified={profile.is_verified}
          primaryText={profile.name}
          secondaryText={formatProfileCardSecondaryText(profile.follower_count)}
          onClick={() => goToRoute(profilePage(profile.handle))}
        />
      )
    })
  }

  const memoizedElements = useMemo(() => {
    return [
      <TabBodyHeader
        key='justForYou'
        title={messages.justForYou}
        description={messages.justForYouDescription}
      >
        <div className={styles.section}>{justForYouTiles}</div>
      </TabBodyHeader>,
      <TabBodyHeader
        key='moodPlaylists'
        title={messages.moodPlaylists}
        description={messages.moodPlaylistsDescription}
      >
        <div className={styles.section}>{lifestyleTiles}</div>
      </TabBodyHeader>,
      <TabBodyHeader key='featuredPlaylists' title={messages.featuredPlaylists}>
        {status === Status.LOADING ? (
          <Spin size='large' className={styles.spin} />
        ) : (
          <CardLineup
            containerClassName={styles.lineupContainer}
            cardsClassName={styles.cardLineup}
            cards={playlistCards}
          />
        )}
      </TabBodyHeader>,
      <TabBodyHeader key='featuredArtists' title={messages.featuredArtists}>
        {status === Status.LOADING ? (
          <Spin size='large' className={styles.spin} />
        ) : (
          <CardLineup
            containerClassName={styles.lineupContainer}
            cardsClassName={styles.cardLineup}
            cards={profileCards}
          />
        )}
      </TabBodyHeader>
    ]
  }, [playlistCards, profileCards, justForYouTiles, lifestyleTiles, status])

  const { tabs, body } = useTabs({
    tabs: tabHeaders,
    elements: memoizedElements
  })

  const { setHeader } = useContext(HeaderContext)
  useEffect(() => {
    setHeader(
      <>
        <Header className={styles.header} title={messages.pageName} />
        <div className={styles.tabBar}>{tabs}</div>
      </>
    )
  }, [setHeader, tabs])

  return (
    <MobilePageContainer
      title={title}
      description={description}
      canonicalUrl={`${BASE_URL}${EXPLORE_PAGE}`}
    >
      <div className={styles.tabContainer}>
        <div className={styles.pageContainer}>{body}</div>
      </div>
    </MobilePageContainer>
  )
}

export default ExplorePage
