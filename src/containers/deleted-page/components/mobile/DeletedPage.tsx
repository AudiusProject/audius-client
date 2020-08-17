import React from 'react'
import { IconVerified, Button, ButtonType, IconUser } from '@audius/stems'
import Lineup, { LineupWithoutTile } from 'containers/lineup/Lineup'
import { withNullGuard } from 'utils/withNullGuard'
import User from 'models/User'

import styles from './DeletedPage.module.css'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import { useTrackCoverArt, useCollectionCoverArt } from 'hooks/useImageSize'
import { ID, PlayableType } from 'models/common/Identifiers'
import { CoverArtSizes, SquareSizes } from 'models/common/ImageSizes'
import ArtistPopover from 'components/artist/ArtistPopover'
import MobilePageContainer from 'components/general/MobilePageContainer'
import Playable from 'models/Playable'
import { NestedNonNullable } from 'utils/typeUtils'

const messages = {
  trackDeleted: 'Track [Deleted By Artist]',
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
      : messages.trackDeleted

    const renderTile = () => {
      return (
        <div className={styles.tile}>
          <div className={styles.type}>{headingText}</div>
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
                {user.is_verified && (
                  <IconVerified className={styles.verified} />
                )}
              </h2>
            </ArtistPopover>
          </div>
          <Button
            textClassName={styles.buttonText}
            text={messages.checkOut(user.name)}
            type={ButtonType.COMMON}
            leftIcon={<IconUser />}
            onClick={goToArtistPage}
          />
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
      <MobilePageContainer
        title={title}
        description={description}
        canonicalUrl={canonicalUrl}
      >
        <div className={styles.contentWrapper}>
          {renderTile()}
          {renderLineup()}
        </div>
      </MobilePageContainer>
    )
  }
)

export default DeletedPage
