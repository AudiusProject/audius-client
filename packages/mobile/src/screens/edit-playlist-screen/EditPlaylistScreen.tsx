import { useCallback } from 'react'

import type { EditPlaylistValues } from '@audius/common'
import {
  SquareSizes,
  cacheCollectionsActions,
  collectionPageLineupActions as tracksActions,
  createPlaylistModalUISelectors
} from '@audius/common'
import { Formik } from 'formik'
import { useDispatch, useSelector } from 'react-redux'

import { useCollectionImage } from 'app/components/image/CollectionImage'
import { isImageUriSource } from 'app/hooks/useContentNodeImage'

import { EditPlaylistNavigator } from './EditPlaylistNavigator'

const { getMetadata } = createPlaylistModalUISelectors
const { editPlaylist } = cacheCollectionsActions

export const EditPlaylistScreen = () => {
  const playlist = useSelector(getMetadata)
  const dispatch = useDispatch()

  const trackImage = useCollectionImage({
    collection: playlist,
    size: SquareSizes.SIZE_1000_BY_1000
  })

  const handleSubmit = useCallback(
    (values: EditPlaylistValues) => {
      if (playlist) {
        dispatch(editPlaylist(playlist.playlist_id, values))
        dispatch(tracksActions.fetchLineupMetadatas())
      }
    },
    [dispatch, playlist]
  )

  if (!playlist) return null

  const initialValues: EditPlaylistValues = {
    ...playlist,
    artwork: {
      url:
        trackImage && isImageUriSource(trackImage.source)
          ? trackImage.source.uri ?? ''
          : ''
    }
  }

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {(formikProps) => (
        <EditPlaylistNavigator
          {...formikProps}
          playlistId={playlist.playlist_id}
        />
      )}
    </Formik>
  )
}
