import { useEffect, useState, useCallback, useContext } from 'react'

import {
  ID,
  CreatePlaylistSource,
  Collection,
  SquareSizes,
  Nullable,
  RandomImage
} from '@audius/common'
import { push as pushRoute } from 'connected-react-router'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { ReactComponent as IconCamera } from 'assets/img/iconCamera.svg'
import placeholderCoverArt from 'assets/img/imageBlank2x.png'
import { getAccountUser } from 'common/store/account/selectors'
import {
  createPlaylist,
  editPlaylist,
  orderPlaylist,
  removeTrackFromPlaylist
} from 'common/store/cache/collections/actions'
import { tracksActions } from 'common/store/pages/collection/lineup/actions'
import * as createPlaylistActions from 'common/store/ui/createPlaylistModal/actions'
import {
  getMetadata,
  getTracks
} from 'common/store/ui/createPlaylistModal/selectors'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import EditableRow, { Format } from 'components/groupable-list/EditableRow'
import GroupableList from 'components/groupable-list/GroupableList'
import Grouping from 'components/groupable-list/Grouping'
import TextElement, { Type } from 'components/nav/mobile/TextElement'
import { useTemporaryNavContext } from 'components/nav/store/context'
import { ToastContext } from 'components/toast/ToastContext'
import TrackList from 'components/track/mobile/TrackList'
import { useCollectionCoverArt } from 'hooks/useCollectionCoverArt'
import useHasChangedRoute from 'hooks/useHasChangedRoute'
import UploadStub from 'pages/profile-page/components/mobile/UploadStub'
import * as schemas from 'schemas'
import { AppState } from 'store/types'
import { resizeImage } from 'utils/imageProcessingUtil'
import { playlistPage } from 'utils/route'
import { withNullGuard } from 'utils/withNullGuard'

import styles from './EditPlaylistPage.module.css'
import RemovePlaylistTrackDrawer from './RemovePlaylistTrackDrawer'

const IS_NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

const messages = {
  createPlaylist: 'Create Playlist',
  editPlaylist: 'Edit Playlist',
  randomPhoto: 'Get Random Artwork',
  placeholderName: 'My Playlist',
  placeholderDescription: 'Give your playlist a description',
  toast: 'Playlist Created!'
}

const initialFormFields = {
  artwork: {},
  ...schemas.newCollectionMetadata()
}

type EditPlaylistPageProps = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

const g = withNullGuard((props: EditPlaylistPageProps) => {
  const { account } = props
  if (account) return { ...props, account }
})

const EditPlaylistPage = g(
  ({
    close,
    goToRoute,
    account,
    createPlaylist,
    metadata,
    tracks,
    removeTrack,
    editPlaylist,
    orderPlaylist,
    refreshLineup
  }) => {
    // Close the page if the route was changed
    useHasChangedRoute(close)
    const initialMetadata = {
      ...(metadata as Collection),
      artwork: { url: '' }
    }

    const { toast } = useContext(ToastContext)
    const [formFields, setFormFields] = useState(
      initialMetadata || initialFormFields
    )

    const [showRemoveTrackDrawer, setShowRemoveTrackDrawer] = useState(false)
    const onDrawerClose = () => setShowRemoveTrackDrawer(false)

    // Holds all tracks to be removed on save
    const [removedTracks, setRemovedTracks] = useState<
      { timestamp: number; trackId: ID }[]
    >([])

    // Holds track to be removed if confirmed
    const [confirmRemoveTrack, setConfirmRemoveTrack] =
      useState<Nullable<{ title: string; trackId: ID; timestamp: number }>>(
        null
      )

    // State to keep track of reordering
    const [reorderedTracks, setReorderedTracks] = useState<number[]>([])
    const [hasReordered, setHasReordered] = useState(false)
    useEffect(() => {
      if (reorderedTracks.length === 0 && tracks && tracks.length !== 0) {
        setReorderedTracks(tracks.map((_: any, i: number) => i))
      }
    }, [setReorderedTracks, reorderedTracks, tracks])

    const existingImage = useCollectionCoverArt(
      formFields.playlist_id,
      formFields._cover_art_sizes,
      SquareSizes.SIZE_1000_BY_1000,
      '' // default
    )
    const [isProcessingImage, setIsProcessingImage] = useState(false)
    const [didChangeArtwork, setDidChangeArtwork] = useState(false)

    const onDropArtwork = useCallback(
      async (selectedFiles: any) => {
        try {
          let file = selectedFiles[0]
          file = await resizeImage(file)
          const url = URL.createObjectURL(file)
          setFormFields((formFields: any) => ({
            ...formFields,
            artwork: { file, url }
          }))
          setDidChangeArtwork(true)
        } catch (err) {
          setFormFields((formFields: any) => ({
            ...formFields,
            artwork: {
              ...(formFields.artwork || {}),
              error: err instanceof Error ? err.message : 'Unknown error'
            }
          }))
        }
      },
      [setFormFields]
    )

    const getRandomArtwork = useCallback(async () => {
      setIsProcessingImage(true)
      const value = await RandomImage.get()
      if (value) {
        await onDropArtwork([value])
      }
      setIsProcessingImage(false)
    }, [onDropArtwork, setIsProcessingImage])

    const onUpdateName = useCallback(
      (name: string) => {
        setFormFields((formFields: any) => ({
          ...formFields,
          playlist_name: name
        }))
      },
      [setFormFields]
    )

    const onUpdateDescription = useCallback(
      (description: string) => {
        setFormFields((formFields: any) => ({ ...formFields, description }))
      },
      [setFormFields]
    )

    const onReorderPlaylist = useCallback(
      (source: number, destination: number) => {
        const reorder = [...reorderedTracks]
        const tmp = reorder[source]
        reorder.splice(source, 1)
        reorder.splice(destination, 0, tmp)

        setHasReordered(true)
        setReorderedTracks(reorder)
      },
      [setHasReordered, reorderedTracks, setReorderedTracks]
    )

    const formatReorder = (
      trackIds: { track: ID; time: number }[],
      reorder: number[]
    ) => {
      return reorder.map((i) => {
        const { track, time } = trackIds[i]
        return {
          id: track,
          time
        }
      })
    }

    const onSave = useCallback(() => {
      // Sanitize description field. Description is required to be present, but can be null
      if (formFields.description === undefined) {
        formFields.description = null
      }
      // Copy the metadata playlist contents so that a reference is not changed between
      // removing tracks, updating track order, and edit playlist
      const playlistTrackIds = [
        ...(metadata?.playlist_contents?.track_ids ?? [])
      ]

      for (const removedTrack of removedTracks) {
        const { playlist_id } = metadata!
        removeTrack(removedTrack.trackId, playlist_id, removedTrack.timestamp)
      }

      if (metadata && formFields.playlist_id) {
        // Edit playlist
        if (hasReordered) {
          // Reorder the playlist and refresh the lineup just in case it's
          // in the view behind the edit playlist page.
          orderPlaylist(
            metadata.playlist_id,
            formatReorder(playlistTrackIds, reorderedTracks)
          )
          // Update the playlist content track_ids so that the editPlaylist
          // optimistically update the cached collection trackIds
          formFields.playlist_contents.track_ids = reorderedTracks.map(
            (idx) => playlistTrackIds[idx]
          )
        }
        refreshLineup()
        editPlaylist(metadata.playlist_id, formFields)

        close()
      } else {
        // Create new playlist
        const tempId = `${Date.now()}`
        createPlaylist(tempId, formFields)
        toast(messages.toast)
        close()
        goToRoute(
          playlistPage(account.handle, formFields.playlist_name, tempId)
        )
      }
    }, [
      formFields,
      createPlaylist,
      close,
      account,
      goToRoute,
      metadata,
      editPlaylist,
      hasReordered,
      reorderedTracks,
      orderPlaylist,
      refreshLineup,
      toast,
      removeTrack,
      removedTracks
    ])

    /**
     * Stores the track to be removed if confirmed
     * Opens the drawer to confirm removal of the track
     */
    const onRemoveTrack = useCallback(
      (index: number) => {
        if ((metadata?.playlist_contents?.track_ids.length ?? 0) <= index)
          return
        const reorderedIndex = reorderedTracks[index]
        const { playlist_contents } = metadata!
        const { track: trackId, time } =
          playlist_contents.track_ids[reorderedIndex]
        const trackMetadata = tracks?.find(
          (track) => track.track_id === trackId
        )
        if (!trackMetadata) return
        setConfirmRemoveTrack({
          title: trackMetadata.title,
          trackId,
          timestamp: time
        })
        setShowRemoveTrackDrawer(true)
      },
      [
        reorderedTracks,
        setShowRemoveTrackDrawer,
        metadata,
        tracks,
        setConfirmRemoveTrack
      ]
    )

    /**
     * Moves the track to be removed to the removedTracks array
     * Closes the drawer to confirm removal of the track
     */
    const onConfirmRemove = useCallback(() => {
      if (!confirmRemoveTrack) return
      const removeIdx = metadata?.playlist_contents.track_ids.findIndex(
        (t) =>
          t.track === confirmRemoveTrack.trackId &&
          t.time === confirmRemoveTrack.timestamp
      )
      if (removeIdx === -1) return
      setRemovedTracks((removed) =>
        removed.concat({
          trackId: confirmRemoveTrack.trackId,
          timestamp: confirmRemoveTrack.timestamp
        })
      )
      setReorderedTracks((tracks) =>
        tracks.filter((trackIndex) => trackIndex !== removeIdx)
      )
      onDrawerClose()
    }, [metadata, confirmRemoveTrack, setRemovedTracks, setReorderedTracks])

    const setters = useCallback(
      () => ({
        left: (
          <TextElement text='Cancel' type={Type.SECONDARY} onClick={close} />
        ),
        center: formFields.playlist_id
          ? messages.editPlaylist
          : messages.createPlaylist,
        right: (
          <TextElement
            text='Save'
            type={Type.PRIMARY}
            isEnabled={!!formFields.playlist_name}
            onClick={onSave}
          />
        )
      }),
      [close, formFields, onSave]
    )

    useTemporaryNavContext(setters)

    // Put together track list if necessary
    let trackList = null
    if (tracks && reorderedTracks.length > 0) {
      trackList = reorderedTracks.map((i) => {
        const t = tracks[i]
        const playlistTrack = metadata?.playlist_contents.track_ids[i]
        const isRemoveActive =
          showRemoveTrackDrawer &&
          t.track_id === confirmRemoveTrack?.trackId &&
          playlistTrack?.time === confirmRemoveTrack?.timestamp

        return {
          isLoading: false,
          artistName: t.user.name,
          artistHandle: t.user.handle,
          trackTitle: t.title,
          trackId: t.track_id,
          time: playlistTrack?.time,
          isDeleted: t.is_delete || !!t.user.is_deactivated,
          isRemoveActive
        }
      })
    }

    return (
      <div className={styles.editPlaylistPage}>
        <div className={styles.artwork}>
          <DynamicImage
            image={
              didChangeArtwork
                ? formFields.artwork.url
                : existingImage || formFields.artwork.url || placeholderCoverArt
            }
            className={styles.image}
            wrapperClassName={styles.imageWrapper}
          >
            {
              <UploadStub
                onChange={onDropArtwork}
                isProcessing={isProcessingImage}
              />
            }
          </DynamicImage>
          <div className={styles.random} onClick={getRandomArtwork}>
            <IconCamera className={styles.iconCamera} />
            <div className={styles.text}>{messages.randomPhoto}</div>
          </div>
        </div>

        <div className={styles.info}>
          <GroupableList>
            <Grouping>
              <EditableRow
                label='Name'
                format={Format.INPUT}
                initialValue={formFields.playlist_name}
                placeholderValue={messages.placeholderName}
                onChange={onUpdateName}
                maxLength={64}
              />
              <EditableRow
                label='Description'
                format={Format.TEXT_AREA}
                initialValue={formFields?.description ?? undefined}
                placeholderValue={messages.placeholderDescription}
                onChange={onUpdateDescription}
                centerLeftElement={false}
                maxLength={256}
              />
            </Grouping>
            {/** Don't render tracklist on native mobile. Errors
             * get thrown because of the null renderer
             */}
            {!IS_NATIVE_MOBILE && trackList && trackList.length > 0 && (
              <Grouping>
                <TrackList
                  tracks={trackList}
                  showDivider
                  noDividerMargin
                  isReorderable
                  onRemove={onRemoveTrack}
                  onReorder={onReorderPlaylist}
                />
              </Grouping>
            )}
          </GroupableList>
        </div>
        <RemovePlaylistTrackDrawer
          isOpen={showRemoveTrackDrawer}
          trackTitle={confirmRemoveTrack?.title}
          onClose={onDrawerClose}
          onConfirm={onConfirmRemove}
        />
      </div>
    )
  }
)

function mapStateToProps(state: AppState) {
  return {
    metadata: getMetadata(state),
    account: getAccountUser(state),
    tracks: getTracks(state)
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    close: () => dispatch(createPlaylistActions.close()),
    createPlaylist: (tempId: string, metadata: Collection) =>
      dispatch(
        createPlaylist(tempId, metadata, CreatePlaylistSource.CREATE_PAGE)
      ),
    editPlaylist: (id: ID, metadata: Collection) =>
      dispatch(editPlaylist(id, metadata)),
    orderPlaylist: (playlistId: ID, idsAndTimes: any) =>
      dispatch(orderPlaylist(playlistId, idsAndTimes)),
    removeTrack: (trackId: ID, playlistId: ID, timestamp: number) =>
      dispatch(removeTrackFromPlaylist(trackId, playlistId, timestamp)),
    refreshLineup: () => dispatch(tracksActions.fetchLineupMetadatas()),
    goToRoute: (route: string) => dispatch(pushRoute(route))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditPlaylistPage)
