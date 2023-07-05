import { useCallback } from 'react'

import {
  ID,
  SquareSizes,
  Status,
  UserTrackMetadata,
  cacheCollectionsActions,
  useGetSuggestedTracks
} from '@audius/common'
import { Button, ButtonSize, ButtonType, IconRefresh } from '@audius/stems'
import { useDispatch } from 'react-redux'

import { Divider } from 'components/divider'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { Tile } from 'components/tile'
import { UserNameAndBadges } from 'components/user-name-and-badges/UserNameAndBadges'
import { useTrackCoverArt2 } from 'hooks/useTrackCoverArt'

import styles from './SuggestedTracks.module.css'

const { addTrackToPlaylist } = cacheCollectionsActions

const messages = {
  title: 'Add some tracks',
  description:
    'Placeholder copy: dependent on backend logic and what we decide to do with this new feature.',
  addTrack: 'Add',
  refresh: 'Refresh'
}

type SuggestedTrackProps = {
  collectionId: ID
  track: UserTrackMetadata
}

const SuggestedTrack = (props: SuggestedTrackProps) => {
  const { track, collectionId } = props
  const { track_id, title, user } = track

  const image = useTrackCoverArt2(track_id, SquareSizes.SIZE_150_BY_150)
  const dispatch = useDispatch()

  const handleAddTrack = useCallback(() => {
    dispatch(addTrackToPlaylist(track_id, collectionId))
  }, [dispatch, track_id, collectionId])

  return (
    <div className={styles.suggestedTrack}>
      <div className={styles.trackDetails}>
        <img src={image} className={styles.trackArtwork} role='presentation' />
        <div className={styles.trackInfo}>
          <p className={styles.trackName}>{title}</p>
          <UserNameAndBadges user={user} />
        </div>
      </div>
      <Button
        type={ButtonType.COMMON}
        text={messages.addTrack}
        size={ButtonSize.SMALL}
        onClick={handleAddTrack}
      />
    </div>
  )
}

type SuggestedTracksProps = {
  collectionId: ID
}

export const SuggestedTracks = (props: SuggestedTracksProps) => {
  const { collectionId } = props
  const { data: suggestedTracks, status, onRefresh } = useGetSuggestedTracks()

  const divider = <Divider className={styles.trackDivider} />

  return (
    <Tile className={styles.root} elevation='mid'>
      <div className={styles.heading}>
        <h4 className={styles.title}>{messages.title}</h4>
        <p className={styles.description}>{messages.description}</p>
      </div>
      <ul>
        {divider}
        {!suggestedTracks && status === Status.LOADING ? (
          <LoadingSpinner className={styles.loading} />
        ) : null}
        {suggestedTracks?.map((suggestedTrack) => (
          <>
            <li key={suggestedTrack.track_id}>
              <SuggestedTrack
                track={suggestedTrack}
                collectionId={collectionId}
              />
            </li>
            {divider}
          </>
        ))}
        {divider}
      </ul>
      <button className={styles.refreshButton} onClick={onRefresh}>
        <div className={styles.refreshContent}>
          <IconRefresh className={styles.refreshIcon} />
          <span className={styles.refreshText}>{messages.refresh}</span>
        </div>
      </button>
    </Tile>
  )
}
