import { useCallback, useMemo } from 'react'

import type { ID, Maybe, SmartCollectionVariant, UID } from '@audius/common'
import {
  removeNullable,
  collectionPageSelectors,
  collectionPageActions,
  playerSelectors,
  Status,
  Name,
  PlaybackSource,
  formatSecondsAsText,
  collectionPageLineupActions as tracksActions,
  reachabilitySelectors
} from '@audius/common'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { createSelector } from 'reselect'

import { Text } from 'app/components/core'
import { DetailsTile } from 'app/components/details-tile'
import type {
  DetailsTileDetail,
  DetailsTileProps
} from 'app/components/details-tile/types'
import { TrackList } from 'app/components/track-list'
import { make, track } from 'app/services/analytics'
import type { AppState } from 'app/store'
import { makeStyles } from 'app/styles'
import { formatCount } from 'app/utils/format'

import { CollectionHeader } from './CollectionHeader'
import { useFetchCollectionLineup } from './useFetchCollectionLineup'
const { resetAndFetchCollectionTracks } = collectionPageActions
const { getPlaying, getUid, getCurrentTrack } = playerSelectors
const { getIsReachable } = reachabilitySelectors
const { getCollectionTracksLineup } = collectionPageSelectors

const selectTrackUids = createSelector(
  (state: AppState) => getCollectionTracksLineup(state).entries,
  (entries) => entries.map(({ uid }) => uid)
)

const selectFirstTrack = (state: AppState) =>
  getCollectionTracksLineup(state).entries[0]

const selectTrackCount = (state: AppState) => {
  return getCollectionTracksLineup(state).entries.length
}

const selectIsLineupLoading = (state: AppState) => {
  return getCollectionTracksLineup(state).status === Status.LOADING
}

const selectCollectionDuration = createSelector(
  (state: AppState) => getCollectionTracksLineup(state).entries,
  (state: AppState) => state.tracks.entries,
  (entries, tracks) => {
    return entries
      .map((entry) => tracks[entry.id]?.metadata.duration)
      .filter(removeNullable)
      .reduce((totalDuration, trackDuration) => {
        return totalDuration + trackDuration
      }, 0)
  }
)

const selectIsQueued = createSelector(
  selectTrackUids,
  getUid,
  (trackUids, playingUid) => {
    return trackUids.some((trackUid) => playingUid === trackUid)
  }
)

const messages = {
  empty: 'This playlist is empty.',
  detailsPlaceholder: '---'
}

const useStyles = makeStyles(({ palette, spacing, typography }) => ({
  trackListDivider: {
    marginHorizontal: spacing(6),
    borderTopWidth: 1,
    borderTopColor: palette.neutralLight7
  },
  empty: {
    ...typography.body,
    color: palette.neutral,
    marginBottom: spacing(8),
    alignSelf: 'center'
  }
}))

type CollectionScreenDetailsTileProps = {
  isAlbum?: boolean
  isPrivate?: boolean
  isPublishing?: boolean
  extraDetails?: DetailsTileDetail[]
  collectionId: number | SmartCollectionVariant
} & Omit<
  DetailsTileProps,
  'descriptionLinkPressSource' | 'details' | 'headerText' | 'onPressPlay'
>

const recordPlay = (id: Maybe<number>, play = true) => {
  track(
    make({
      eventName: play ? Name.PLAYBACK_PLAY : Name.PLAYBACK_PAUSE,
      id: String(id),
      source: PlaybackSource.PLAYLIST_PAGE
    })
  )
}

export const CollectionScreenDetailsTile = ({
  description,
  extraDetails = [],
  collectionId,
  isAlbum,
  isPrivate,
  isPublishing,
  renderImage,
  trackCount: trackCountProp,
  ...detailsTileProps
}: CollectionScreenDetailsTileProps) => {
  const styles = useStyles()
  const dispatch = useDispatch()

  const isReachable = useSelector(getIsReachable)

  const fetchLineup = useCallback(() => {
    dispatch(resetAndFetchCollectionTracks(collectionId))
  }, [dispatch, collectionId])

  useFetchCollectionLineup(collectionId, fetchLineup)

  const trackUids = useSelector(selectTrackUids)
  const collectionTrackCount = useSelector(selectTrackCount)
  const trackCount = trackCountProp ?? collectionTrackCount
  const isLineupLoading = useSelector(selectIsLineupLoading)
  const collectionDuration = useSelector(selectCollectionDuration)
  const playingUid = useSelector(getUid)
  const isQueued = useSelector(selectIsQueued)
  const isPlaying = useSelector(getPlaying)
  const playingTrack = useSelector(getCurrentTrack)
  const playingTrackId = playingTrack?.track_id
  const firstTrack = useSelector(selectFirstTrack)

  const details = useMemo(() => {
    if (!isLineupLoading && trackCount === 0) return []
    return [
      {
        label: 'Tracks',
        value: isLineupLoading
          ? messages.detailsPlaceholder
          : formatCount(trackCount)
      },
      {
        label: 'Duration',
        value: isLineupLoading
          ? messages.detailsPlaceholder
          : formatSecondsAsText(collectionDuration)
      },
      ...extraDetails
    ].filter(({ isHidden, value }) => !isHidden && !!value)
  }, [isLineupLoading, trackCount, collectionDuration, extraDetails])

  const handlePressPlay = useCallback(() => {
    if (isPlaying && isQueued) {
      dispatch(tracksActions.pause())
      recordPlay(playingTrackId, false)
    } else if (!isPlaying && isQueued) {
      dispatch(tracksActions.play())
      recordPlay(playingTrackId)
    } else if (trackCount > 0 && firstTrack) {
      dispatch(tracksActions.play(firstTrack.uid))
      recordPlay(firstTrack.id)
    }
  }, [dispatch, isPlaying, playingTrackId, isQueued, trackCount, firstTrack])

  const handlePressTrackListItemPlay = useCallback(
    (uid: UID, id: ID) => {
      if (isPlaying && playingUid === uid) {
        dispatch(tracksActions.pause())
        recordPlay(id, false)
      } else if (playingUid !== uid) {
        dispatch(tracksActions.play(uid))
        recordPlay(id)
      } else {
        dispatch(tracksActions.play())
        recordPlay(id)
      }
    },
    [dispatch, isPlaying, playingUid]
  )

  const renderHeader = useCallback(
    () => <CollectionHeader collectionId={collectionId} />,
    [collectionId]
  )

  const renderTrackList = useCallback(() => {
    return (
      <TrackList
        hideArt
        showDivider
        showSkeleton={isLineupLoading}
        togglePlay={handlePressTrackListItemPlay}
        uids={isLineupLoading ? Array(Math.min(5, trackCount ?? 0)) : trackUids}
        ListHeaderComponent={
          trackCount > 0 ? <View style={styles.trackListDivider} /> : undefined
        }
        ListEmptyComponent={<Text style={styles.empty}>{messages.empty}</Text>}
      />
    )
  }, [
    handlePressTrackListItemPlay,
    isLineupLoading,
    styles,
    trackUids,
    trackCount
  ])

  const isPlayable = isQueued || (trackCount > 0 && !!firstTrack)

  return (
    <DetailsTile
      {...detailsTileProps}
      description={description}
      descriptionLinkPressSource='collection page'
      details={details}
      hideOverflow={detailsTileProps.hideOverflow || !isReachable}
      hideListenCount={true}
      hideRepost={!isReachable}
      isPlaying={isPlaying && isQueued}
      renderBottomContent={renderTrackList}
      renderHeader={renderHeader}
      renderImage={renderImage}
      onPressPlay={handlePressPlay}
      isPlayable={isPlayable}
    />
  )
}
