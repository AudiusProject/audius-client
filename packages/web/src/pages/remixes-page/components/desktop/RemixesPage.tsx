import { Track, User } from '@audius/common'
import cn from 'classnames'

import { ReactComponent as IconRemixes } from 'assets/img/iconRemix.svg'
import { pluralize } from 'common/utils/formatUtil'
import Header from 'components/header/desktop/Header'
import Lineup, { LineupWithoutTile } from 'components/lineup/Lineup'
import Page from 'components/page/Page'
import UserBadges from 'components/user-badges/UserBadges'
import { fullTrackRemixesPage } from 'utils/route'
import { isMatrix } from 'utils/theme/theme'
import { withNullGuard } from 'utils/withNullGuard'

import styles from './RemixesPage.module.css'

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
            <IconRemixes
              className={cn(styles.iconRemix, { [styles.matrix]: isMatrix() })}
            />
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
              <UserBadges
                className={styles.iconVerified}
                userId={user.user_id}
                badgeSize={12}
              />
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
        canonicalUrl={fullTrackRemixesPage(originalTrack.permalink)}
        header={renderHeader()}
      >
        <Lineup {...getLineupProps()} />
      </Page>
    )
  }
)

export default RemixesPage
