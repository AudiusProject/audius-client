import React from 'react'
import Page from 'components/general/Page'
import Header from 'components/general/header/desktop/Header'
import { ReactComponent as IconRemixes } from 'assets/img/iconRemix.svg'
import { ReactComponent as IconVerified } from 'assets/img/iconVerified.svg'

import styles from './RemixesPage.module.css'
import Lineup, { LineupWithoutTile } from 'containers/lineup/Lineup'
import { withNullGuard } from 'utils/withNullGuard'
import Track from 'models/Track'
import User from 'models/User'
import { pluralize } from 'utils/formatUtil'
import { fullTrackRemixesPage } from 'utils/route'

const messages = {
  remixes: 'Remix',
  by: 'by',
  of: 'of',
  getDescription: (trackName: string, artistName: string) =>
    `${messages.remixes} ${messages.of} ${trackName} ${messages.by} ${artistName}`
}

export type RemixesPageProps = {
  title: string
  count: number | null
  originalTrack: Track | null
  user: User | null
  getLineupProps: () => LineupWithoutTile
  goToTrackPage: () => void
  goToArtistPage: () => void
}

const g = withNullGuard(
  ({ originalTrack, user, ...p }: RemixesPageProps) =>
    originalTrack && user && { ...p, originalTrack, user }
)

const RemixesPage = g(
  ({
    title,
    count,
    originalTrack,
    user,
    getLineupProps,
    goToTrackPage,
    goToArtistPage
  }) => {
    const renderHeader = () => (
      <Header
        wrapperClassName={styles.header}
        primary={
          <div className={styles.headerPrimary}>
            <IconRemixes className={styles.iconRemix} />
            <span>{title}</span>
          </div>
        }
        secondary={
          <div className={styles.headerSecondary}>
            {`${count || ''} ${pluralize(
              messages.remixes,
              count,
              'es',
              !count
            )} ${messages.of}`}
            <div className={styles.link} onClick={goToTrackPage}>
              {originalTrack.title}
            </div>
            {messages.by}
            <div className={styles.link} onClick={goToArtistPage}>
              {user.name}
              {user.is_verified && (
                <IconVerified className={styles.iconVerified} />
              )}
            </div>
          </div>
        }
        containerStyles={styles.header}
      />
    )

    return (
      <Page
        title={title}
        description={messages.getDescription(originalTrack.title, user.name)}
        canonicalUrl={fullTrackRemixesPage(
          user.handle,
          originalTrack.title,
          originalTrack.track_id
        )}
        header={renderHeader()}
      >
        <Lineup {...getLineupProps()} />
      </Page>
    )
  }
)

export default RemixesPage
