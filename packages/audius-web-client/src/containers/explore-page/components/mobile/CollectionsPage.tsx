import React, { useContext, useEffect } from 'react'
import Spin from 'antd/lib/spin'

import { UserCollection } from 'models/Collection'
import { Status } from 'store/types'
import { playlistPage, albumPage, BASE_URL, EXPLORE_PAGE } from 'utils/route'

import MobilePageContainer from 'components/general/MobilePageContainer'
import Header from 'components/general/header/mobile/Header'
import Card from 'components/card/mobile/Card'
import CardLineup from 'containers/lineup/CardLineup'
import { useSubPageHeader } from 'containers/nav/store/context'

import styles from './CollectionsPage.module.css'
import { HeaderContext } from 'components/general/header/mobile/HeaderContextProvider'
import { ID } from 'models/common/Identifiers'

export type CollectionsPageProps = {
  title: string
  description: string
  collections: UserCollection[]
  status: Status
  onClickReposts: (id: ID) => void
  onClickFavorites: (id: ID) => void
  goToRoute: (route: string) => void
}

const ExplorePage = ({
  title,
  description,
  collections,
  status,
  onClickReposts,
  onClickFavorites,
  goToRoute
}: CollectionsPageProps) => {
  useSubPageHeader()

  const playlistCards = collections.map((playlist: UserCollection) => {
    return (
      <Card
        key={playlist.playlist_id}
        id={playlist.playlist_id}
        imageSize={playlist._cover_art_sizes}
        primaryText={playlist.playlist_name}
        secondaryText={playlist.user.name}
        trackCount={playlist.playlist_contents.track_ids.length}
        reposts={playlist.repost_count}
        favorites={playlist.save_count}
        onClickReposts={() => onClickReposts(playlist.playlist_id)}
        onClickFavorites={() => onClickFavorites(playlist.playlist_id)}
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

  const cards = (
    <CardLineup
      containerClassName={styles.lineupContainer}
      cardsClassName={styles.cardLineup}
      cards={playlistCards}
    />
  )

  const { setHeader } = useContext(HeaderContext)
  useEffect(() => {
    setHeader(
      <>
        <Header className={styles.header} title={title} />
      </>
    )
  }, [setHeader, title])

  return (
    <MobilePageContainer
      title={title}
      description={description}
      canonicalUrl={`${BASE_URL}${EXPLORE_PAGE}`}
      containerClassName={styles.pageContainer}
      hasDefaultHeader
    >
      {status === Status.LOADING ? (
        <Spin size='large' className={styles.spin} />
      ) : (
        cards
      )}
    </MobilePageContainer>
  )
}

export default ExplorePage
