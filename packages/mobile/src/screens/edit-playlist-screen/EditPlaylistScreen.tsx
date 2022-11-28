import { useCallback } from 'react'

import type { Collection } from '@audius/common'
import {
  cacheCollectionsActions,
  collectionPageLineupActions as tracksActions,
  createPlaylistModalUISelectors
} from '@audius/common'
import type { FormikProps } from 'formik'
import { Formik } from 'formik'
import { isEqual } from 'lodash'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { FormScreen } from 'app/components/form-screen'
import { useCollectionImage } from 'app/components/image/CollectionImage'
import { TrackList } from 'app/components/track-list'
import { makeStyles } from 'app/styles'

import { PlaylistDescriptionInput } from './PlaylistDescriptionInput'
import { PlaylistImageInput } from './PlaylistImageInput'
import { PlaylistNameInput } from './PlaylistNameInput'
import type { PlaylistValues } from './types'
const { getMetadata, getTracks } = createPlaylistModalUISelectors
const { editPlaylist, orderPlaylist, removeTrackFromPlaylist } =
  cacheCollectionsActions

const useStyles = makeStyles(({ spacing }) => ({
  footer: {
    paddingBottom: spacing(50)
  }
}))

const EditPlaylistForm = (props: FormikProps<PlaylistValues>) => {
  const { values, handleSubmit, handleReset, setFieldValue } = props
  const styles = useStyles()

  const handleReorder = useCallback(
    ({ data, from, to }) => {
      const reorder = [...values.track_ids]
      const tmp = reorder[from]
      reorder.splice(from, 1)
      reorder.splice(to, 0, tmp)

      setFieldValue('track_ids', reorder)
      setFieldValue('tracks', data)
    },
    [setFieldValue, values.track_ids]
  )

  const handleRemove = useCallback(
    (index: number) => {
      if ((values.track_ids.length ?? 0) <= index) {
        return
      }
      const { track: trackId, time } = values.track_ids[index]

      const trackMetadata = values.tracks?.find(
        ({ track_id }) => track_id === trackId
      )

      if (!trackMetadata) return

      setFieldValue('removedTracks', [
        ...values.removedTracks,
        { trackId, timestamp: time }
      ])

      const tracks = [...(values.tracks ?? [])]
      tracks.splice(index, 1)

      setFieldValue('tracks', tracks)
    },
    [values.track_ids, values.tracks, values.removedTracks, setFieldValue]
  )

  const header = (
    <>
      <PlaylistImageInput />
      <PlaylistNameInput />
      <PlaylistDescriptionInput />
    </>
  )

  return (
    <FormScreen onSubmit={handleSubmit} onReset={handleReset} goBackOnSubmit>
      {values.tracks ? (
        <TrackList
          hideArt
          isReorderable
          onReorder={handleReorder}
          onRemove={handleRemove}
          tracks={values.tracks}
          trackItemAction='remove'
          ListHeaderComponent={header}
          ListFooterComponent={<View style={styles.footer} />}
        />
      ) : (
        header
      )}
    </FormScreen>
  )
}

export const EditPlaylistScreen = () => {
  const playlist = useSelector(getMetadata)
  const dispatch = useDispatch()
  const tracks = useSelector(getTracks)

  const { source: coverArt } = useCollectionImage(playlist)

  const handleSubmit = useCallback(
    (values: PlaylistValues) => {
      if (playlist) {
        values.removedTracks.forEach(({ trackId, timestamp }) => {
          dispatch(
            removeTrackFromPlaylist(trackId, playlist.playlist_id, timestamp)
          )
        })
        if (!isEqual(playlist?.playlist_contents.track_ids, values.track_ids)) {
          dispatch(
            orderPlaylist(
              playlist?.playlist_id,
              values.track_ids.map(({ track, time }) => ({ id: track, time }))
            )
          )
        }
        dispatch(
          editPlaylist(playlist.playlist_id, values as unknown as Collection)
        )
        dispatch(tracksActions.fetchLineupMetadatas())
      }
    },
    [dispatch, playlist]
  )

  if (!playlist) return null

  const { playlist_name, description } = playlist

  const initialValues = {
    playlist_name,
    description,
    artwork: { url: coverArt[0].uri ?? '' },
    removedTracks: [],
    tracks,
    track_ids: playlist.playlist_contents.track_ids
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      component={EditPlaylistForm}
    />
  )
}
