import React, { useCallback } from 'react'

import Lottie from 'react-lottie'

import loadingSpinner from 'assets/animations/loadingSpinner.json'
import {
  UserCollection,
  Variant as CollectionVariant
} from 'common/models/Collection'
import Status from 'common/models/Status'
import { User } from 'common/models/User'
import { ExploreCollectionsVariant } from 'common/store/pages/explore/types'
import CollectionArtCard from 'components/card/desktop/CollectionArtCard'
import UserArtCard from 'components/card/desktop/UserArtCard'
import Header from 'components/header/desktop/Header'
import Page from 'components/page/Page'
import PerspectiveCard, {
  TextInterior,
  EmojiInterior
} from 'components/perspective-card/PerspectiveCard'
import { useOrderedLoad } from 'hooks/useOrderedLoad'
import {
  LET_THEM_DJ,
  TOP_ALBUMS,
  TRENDING_PLAYLISTS,
  TRENDING_UNDERGROUND,
  CHILL_PLAYLISTS,
  UPBEAT_PLAYLISTS,
  INTENSE_PLAYLISTS,
  PROVOKING_PLAYLISTS,
  INTIMATE_PLAYLISTS
} from 'pages/explore-page/collections'
import {
  HEAVY_ROTATION,
  BEST_NEW_RELEASES,
  UNDER_THE_RADAR,
  MOST_LOVED,
  REMIXABLES,
  FEELING_LUCKY
} from 'pages/smart-collection/smartCollections'
import { BASE_URL, EXPLORE_PAGE, stripBaseUrl } from 'utils/route'

import styles from './ExplorePage.module.css'
import Section, { Layout } from './Section'

const messages = {
  featuredPlaylists: 'Playlists We Love Right Now',
  featuredProfiles: 'Artists You Should Follow',
  exploreMorePlaylists: 'Explore More Playlists',
  exploreMoreProfiles: 'Explore More Artists',
  justForYou: 'Just For You',
  justForYouSubtitle: `Content curated for you based on your likes,
reposts, and follows. Refreshes often so if you like a track, favorite it.`,
  lifestyle: 'Playlists to Fit Your Mood',
  lifestyleSubtitle: 'Playlists made by Audius users, sorted by mood and feel'
}

export const justForYou = [
  TRENDING_PLAYLISTS,
  TRENDING_UNDERGROUND,
  HEAVY_ROTATION,
  LET_THEM_DJ,
  BEST_NEW_RELEASES,
  UNDER_THE_RADAR,
  TOP_ALBUMS,
  REMIXABLES,
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

export type ExplorePageProps = {
  title: string
  description: string
  playlists: UserCollection[]
  profiles: User[]
  status: Status
  goToRoute: (route: string) => void
}

const ExplorePage = ({
  title,
  description,
  playlists,
  profiles,
  status,
  goToRoute
}: ExplorePageProps) => {
  const {
    isLoading: isLoadingPlaylist,
    setDidLoad: setDidLoadPlaylist
  } = useOrderedLoad(playlists.length)
  const {
    isLoading: isLoadingProfiles,
    setDidLoad: setDidLoadProfile
  } = useOrderedLoad(profiles.length)

  const header = <Header primary={title} containerStyles={styles.header} />
  const onClickCard = useCallback(
    (url: string) => {
      if (url.startsWith(BASE_URL)) {
        goToRoute(stripBaseUrl(url))
      } else if (url.startsWith('http')) {
        const win = window.open(url, '_blank')
        if (win) win.focus()
      } else {
        goToRoute(url)
      }
    },
    [goToRoute]
  )

  return (
    <Page
      title={title}
      description={description}
      canonicalUrl={`${BASE_URL}${EXPLORE_PAGE}`}
      contentClassName={styles.page}
      header={header}
    >
      <Section
        title={messages.justForYou}
        subtitle={messages.justForYouSubtitle}
        layout={Layout.TWO_COLUMN_DYNAMIC_WITH_DOUBLE_LEADING_ELEMENT}
      >
        {justForYou.map(i => {
          const title =
            i.variant === CollectionVariant.SMART ? i.playlist_name : i.title
          const subtitle =
            i.variant === CollectionVariant.SMART ? i.description : i.subtitle
          const Icon = i.icon ? i.icon : React.Fragment
          return (
            <PerspectiveCard
              key={title}
              backgroundGradient={i.gradient}
              shadowColor={i.shadow}
              useOverlayBlendMode={
                i.variant !== ExploreCollectionsVariant.DIRECT_LINK
              }
              // @ts-ignore
              backgroundIcon={<Icon />}
              onClick={() => onClickCard(i.link)}
              isIncentivized={!!i.incentivized}
              sensitivity={i.cardSensitivity}
            >
              <TextInterior title={title} subtitle={subtitle} />
            </PerspectiveCard>
          )
        })}
      </Section>

      <Section title={messages.lifestyle} subtitle={messages.lifestyleSubtitle}>
        {lifestyle.map(i => (
          <PerspectiveCard
            key={i.title}
            backgroundGradient={i.gradient}
            shadowColor={i.shadow}
            onClick={() => goToRoute(i.link)}
          >
            <EmojiInterior title={i.title} emoji={i.emoji} />
          </PerspectiveCard>
        ))}
      </Section>

      <Section
        title={messages.featuredPlaylists}
        expandable
        expandText={messages.exploreMorePlaylists}
      >
        {status === Status.LOADING ? (
          <div className={styles.loadingSpinner}>
            <Lottie
              options={{
                loop: true,
                autoplay: true,
                animationData: loadingSpinner
              }}
            />
          </div>
        ) : (
          playlists.map((playlist: UserCollection, i: number) => {
            return (
              <CollectionArtCard
                key={playlist.playlist_id}
                id={playlist.playlist_id}
                index={i}
                isLoading={isLoadingPlaylist(i)}
                setDidLoad={setDidLoadPlaylist}
              />
            )
          })
        )}
      </Section>

      <Section
        title={messages.featuredProfiles}
        expandable
        expandText={messages.exploreMoreProfiles}
      >
        {status === Status.LOADING ? (
          <div className={styles.loadingSpinner}>
            <Lottie
              options={{
                loop: true,
                autoplay: true,
                animationData: loadingSpinner
              }}
            />
          </div>
        ) : (
          profiles.map((profile: User, i: number) => {
            return (
              <UserArtCard
                key={profile.user_id}
                id={profile.user_id}
                index={i}
                isLoading={isLoadingProfiles(i)}
                setDidLoad={setDidLoadProfile}
              />
            )
          })
        )}
      </Section>
    </Page>
  )
}

export default ExplorePage
