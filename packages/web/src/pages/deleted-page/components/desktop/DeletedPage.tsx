import {
  ID,
  PlayableType,
  CoverArtSizes,
  SquareSizes,
  Playable,
  User,
  NestedNonNullable
} from '@audius/common'
import { Button, ButtonType, IconUser } from '@audius/stems'

import { ArtistPopover } from 'components/artist/ArtistPopover'
import CoverPhoto from 'components/cover-photo/CoverPhoto'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import Lineup, { LineupWithoutTile } from 'components/lineup/Lineup'
import NavBanner from 'components/nav-banner/NavBanner'
import Page from 'components/page/Page'
import StatBanner from 'components/stat-banner/StatBanner'
import UserBadges from 'components/user-badges/UserBadges'
import { useCollectionCoverArt } from 'hooks/useCollectionCoverArt'
import { useTrackCoverArt } from 'hooks/useTrackCoverArt'
import { withNullGuard } from 'utils/withNullGuard'

import styles from './DeletedPage.module.css'

const messages = {
  trackDeleted: 'Track [Deleted]',
  trackDeletedByArtist: 'Track [Deleted By Artist]',
  playlistDeleted: 'Playlist [Deleted by Artist]',
  albumDeleted: 'Album [Deleted By Artist]',
  checkOut: (name: string) => `Check out more by ${name}`,
  moreBy: (name: string) => `More by ${name}`
}

const TrackArt = ({
  trackId,
  coverArtSizes
}: {
  trackId: ID
  coverArtSizes: CoverArtSizes
}) => {
  const image = useTrackCoverArt(
    trackId,
    coverArtSizes,
    SquareSizes.SIZE_480_BY_480
  )
  return <DynamicImage wrapperClassName={styles.image} image={image} />
}

const CollectionArt = ({
  collectionId,
  coverArtSizes
}: {
  collectionId: ID
  coverArtSizes: CoverArtSizes
}) => {
  const image = useCollectionCoverArt(
    collectionId,
    coverArtSizes,
    SquareSizes.SIZE_480_BY_480
  )
  return <DynamicImage wrapperClassName={styles.image} image={image} />
}

export type DeletedPageProps = {
  title: string
  description: string
  canonicalUrl: string
  deletedByArtist: boolean

  playable: Playable
  user: User | null
  getLineupProps: () => LineupWithoutTile
  goToArtistPage: () => void
}

const g = withNullGuard(
  ({ playable, user, ...p }: DeletedPageProps) =>
    playable?.metadata &&
    user && { ...p, playable: playable as NestedNonNullable<Playable>, user }
)

const DeletedPage = g(
  ({
    title,
    description,
    canonicalUrl,
    playable,
    user,
    deletedByArtist = true,
    getLineupProps,
    goToArtistPage
  }) => {
    const isPlaylist =
      playable.type === PlayableType.PLAYLIST ||
      playable.type === PlayableType.ALBUM
    const isAlbum = playable.type === PlayableType.ALBUM

    const headingText = isPlaylist
      ? isAlbum
        ? messages.albumDeleted
        : messages.playlistDeleted
      : deletedByArtist
      ? messages.trackDeletedByArtist
      : messages.trackDeleted

    const renderTile = () => {
      return (
        <div className={styles.tile}>
          {playable.type === PlayableType.PLAYLIST ||
          playable.type === PlayableType.ALBUM ? (
            <CollectionArt
              collectionId={playable.metadata.playlist_id}
              coverArtSizes={playable.metadata._cover_art_sizes}
            />
          ) : (
            <TrackArt
              trackId={playable.metadata.track_id}
              coverArtSizes={playable.metadata._cover_art_sizes}
            />
          )}
          <div className={styles.rightSide}>
            <div className={styles.type}>{headingText}</div>
            <div className={styles.title}>
              <h1>
                {playable.type === PlayableType.PLAYLIST ||
                playable.type === PlayableType.ALBUM
                  ? playable.metadata.playlist_name
                  : playable.metadata.title}
              </h1>
            </div>
            <div className={styles.artistWrapper}>
              <span>By</span>
              <ArtistPopover handle={user.handle}>
                <h2 className={styles.artist} onClick={goToArtistPage}>
                  {user.name}
                  <UserBadges
                    userId={user?.user_id}
                    badgeSize={16}
                    className={styles.verified}
                  />
                </h2>
              </ArtistPopover>
            </div>
            <div>
              <Button
                textClassName={styles.buttonText}
                text={messages.checkOut(user.name)}
                type={ButtonType.COMMON}
                leftIcon={<IconUser />}
                onClick={goToArtistPage}
              />
            </div>
          </div>
        </div>
      )
    }

    const renderLineup = () => {
      return (
        <div className={styles.lineupWrapper}>
          <div className={styles.lineupHeader}>{`${messages.moreBy(
            user.name
          )}`}</div>
          <Lineup {...getLineupProps()} />
        </div>
      )
    }

    return (
      <Page
        title={title}
        description={description}
        canonicalUrl={canonicalUrl}
        variant='flush'
        scrollableSearch
      >
        <div className={styles.headerWrapper}>
          <CoverPhoto
            userId={user ? user.user_id : null}
            coverPhotoSizes={user ? user._cover_photo_sizes : null}
          />
          <StatBanner empty />
          <NavBanner empty />
        </div>
        <div className={styles.contentWrapper}>
          {renderTile()}
          {renderLineup()}
        </div>
      </Page>
    )
  }
)

export default DeletedPage
