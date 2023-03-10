import type { Collection } from '@audius/common'
import { removeNullable, cacheCollectionsSelectors } from '@audius/common'
import { isEqual, partition } from 'lodash'
import { View } from 'react-native'
import { useSelector } from 'react-redux'
import { createSelector } from 'reselect'

import IconAlbum from 'app/assets/images/iconAlbum.svg'
import IconNote from 'app/assets/images/iconNote.svg'
import IconPlaylist from 'app/assets/images/iconPlaylists.svg'
import { Divider, Tile } from 'app/components/core'
import { DOWNLOAD_REASON_FAVORITES } from 'app/store/offline-downloads/constants'
import {
  getOfflineCollectionsStatus,
  getOfflineTrackMetadata,
  getOfflineTrackStatus
} from 'app/store/offline-downloads/selectors'
import { OfflineDownloadStatus } from 'app/store/offline-downloads/slice'
import { makeStyles } from 'app/styles'

import { FavoritesDownloadStatusIndicator } from '../favorites-screen/FavoritesDownloadStatusIndicator'

import { DownloadProgressRow } from './DownloadProgressRow'
const { getCollections } = cacheCollectionsSelectors
type DownloadProgressDetailedProps = {
  favoritesToggleValue: boolean
}

const useStyles = makeStyles(({ palette, spacing }) => ({
  root: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    margin: spacing(4),
    marginVertical: spacing(6)
  },
  dividerLine: {
    marginHorizontal: spacing(6),
    borderTopWidth: 1,
    borderTopColor: palette.neutralLight7
  }
}))

const getTrackDownloadProgress = createSelector(
  [getOfflineTrackMetadata, getOfflineTrackStatus],
  (offlineTrackMetadata, offlineTrackStatus) => {
    const favoritedTracks = Object.entries(offlineTrackMetadata)
      .filter(([_id, offlineTrackMetadata]) =>
        offlineTrackMetadata.reasons_for_download.some((reason) =>
          isEqual(reason, {
            is_from_favorites: true,
            collection_id: DOWNLOAD_REASON_FAVORITES
          })
        )
      )
      .map(([id, _offlineTrackMetadata]) => parseInt(id))
    const numDownloads = favoritedTracks.length
    const numDownloadsSuccess = favoritedTracks.filter(
      (trackId) => offlineTrackStatus[trackId] === OfflineDownloadStatus.SUCCESS
    ).length
    return [numDownloads, numDownloadsSuccess]
  }
)

const getCollectionProgress = createSelector(
  [getCollections, getOfflineCollectionsStatus, getOfflineTrackStatus],
  (collections, offlineCollectionsStatus, offlineTrackStatus) => {
    const collectionIds = Object.keys(offlineCollectionsStatus)
    const [albumIds, playlistIds] = partition(
      collectionIds.filter((collectionId) => collections[collectionId]),
      (collectionId) => collections[collectionId].is_album
    )

    const albumCount = albumIds.length
    const playlistCount = playlistIds.length

    const getSuccessfulCollections = (collectionIds: string[]) =>
      collectionIds.filter((albumId) => {
        const collection: Collection = collections[albumId]
        if (!collection) return false
        const trackStatuses = collection.playlist_contents.track_ids
          .map(({ track: trackId }) => offlineTrackStatus[trackId])
          .filter(removeNullable)

        return trackStatuses.every(
          (status) =>
            status === OfflineDownloadStatus.SUCCESS ||
            status === OfflineDownloadStatus.ERROR ||
            status === OfflineDownloadStatus.ABANDONED
        )
      }).length

    const albumSuccessCount = getSuccessfulCollections(albumIds)
    const playlistSuccessCount = getSuccessfulCollections(playlistIds)

    return [albumCount, albumSuccessCount, playlistCount, playlistSuccessCount]
  }
)

export const DownloadProgressDetailed = (
  props: DownloadProgressDetailedProps
) => {
  const { favoritesToggleValue } = props

  const styles = useStyles()
  const [trackDownloads, trackDownloadsSuccess] = useSelector(
    getTrackDownloadProgress
  )
  const [albumCount, albumSuccessCount, playlistCount, playlistSuccessCount] =
    useSelector(getCollectionProgress)

  if (!trackDownloads || !albumCount || !playlistCount) return <Divider />

  return (
    <Tile style={styles.root}>
      <FavoritesDownloadStatusIndicator switchValue={favoritesToggleValue} />
      <View style={styles.dividerLine} />
      <DownloadProgressRow
        title='Tracks'
        icon={IconNote}
        numDownloads={trackDownloads}
        numDownloadsSuccess={trackDownloadsSuccess}
      />
      <DownloadProgressRow
        title='Albums'
        icon={IconAlbum}
        numDownloads={albumCount}
        numDownloadsSuccess={albumSuccessCount}
      />
      <DownloadProgressRow
        title='Playlists'
        icon={IconPlaylist}
        numDownloads={playlistCount}
        numDownloadsSuccess={playlistSuccessCount}
      />
    </Tile>
  )
}
