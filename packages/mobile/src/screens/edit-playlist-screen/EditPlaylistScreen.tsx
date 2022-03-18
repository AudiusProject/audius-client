import { useCallback, useState } from 'react'

import { useNavigation } from '@react-navigation/native'
import { SquareSizes } from 'audius-client/src/common/models/ImageSizes'
import RandomImage from 'audius-client/src/common/services/RandomImage'
import {
  editPlaylist,
  orderPlaylist,
  removeTrackFromPlaylist
} from 'common/store/cache/collections/actions'
import { tracksActions } from 'common/store/pages/collection/lineup/actions'
import {
  getMetadata,
  getTracks
} from 'common/store/ui/createPlaylistModal/selectors'
import { Formik, FormikProps } from 'formik'
import { isEqual } from 'lodash'
import { Pressable, Text, View } from 'react-native'

import IconCamera from 'app/assets/images/iconCamera.svg'
import {
  Screen,
  TextButton,
  FormTextInput,
  FormImageInput,
  VirtualizedScrollView
} from 'app/components/core'
import { TrackList } from 'app/components/track-list'
import { useCollectionCoverArt } from 'app/hooks/useCollectionCoverArt'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { flexRowCentered, makeStyles } from 'app/styles'

import { PlaylistValues } from './types'

// const getPlaylistTracks = makeGetTableMetadatas(
//   (state: CommonState) => getMetadata(state)?.tracks
// )

const messages = {
  cancel: 'Cancel',
  descriptionPlaceholder: 'Give your playlist a description',
  getRandomArt: 'Get Random Artwork',
  save: 'Save',
  title: 'Edit Playlist'
}

const useStyles = makeStyles(({ palette, spacing, typography }) => ({
  form: {
    paddingTop: spacing(8)
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing(8)
  },
  getRandomArt: {
    ...flexRowCentered(),
    justifyContent: 'center',
    marginTop: spacing(2)
  },
  getRandomArtText: {
    ...typography.body,
    color: palette.secondary,
    marginLeft: spacing(2)
  },
  tracklist: {
    marginBottom: spacing(50)
  }
}))

const EditPlaylistForm = (props: FormikProps<PlaylistValues>) => {
  const { values, handleSubmit, handleReset, setFieldValue } = props
  const navigation = useNavigation()
  const styles = useStyles()
  const [isProcessingImage, setIsProcessingImage] = useState(false)

  const handlePressGetRandomArtwork = useCallback(async () => {
    setIsProcessingImage(true)
    const value = await RandomImage.get()
    if (value) {
      const url = URL.createObjectURL(value)
      setFieldValue('artwork', { file: value, url })
      setIsProcessingImage(false)
    }
  }, [setFieldValue])

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

  return (
    <Screen
      variant='secondary'
      title={messages.title}
      topbarLeft={
        <TextButton
          title={messages.cancel}
          variant='secondary'
          onPress={() => {
            navigation.goBack()
            handleReset()
          }}
        />
      }
      topbarRight={
        <TextButton
          title={messages.save}
          variant='primary'
          onPress={() => {
            handleSubmit()
            navigation.goBack()
          }}
        />
      }
    >
      <VirtualizedScrollView style={styles.form}>
        <View style={styles.header}>
          <View>
            <FormImageInput name='artwork' isProcessing={isProcessingImage} />
            <Pressable
              onPress={handlePressGetRandomArtwork}
              style={styles.getRandomArt}
            >
              <IconCamera height={18} width={18} />
              <Text style={styles.getRandomArtText}>
                {messages.getRandomArt}
              </Text>
            </Pressable>
          </View>
        </View>
        <FormTextInput isFirstInput name='playlist_name' label='Name' />
        <FormTextInput
          placeholder={messages.descriptionPlaceholder}
          name='description'
          label='Description'
          multiline
          maxLength={256}
          styles={{ root: { minHeight: 100 }, label: { lineHeight: 28 } }}
        />
        <View style={styles.tracklist}>
          {values.tracks ? (
            <>
              {/** TODO: clean up types/interface here */}
              <TrackList
                hideArt
                isReorderable
                onReorder={handleReorder}
                tracks={{ entries: values.tracks } as any}
              />
            </>
          ) : null}
        </View>
      </VirtualizedScrollView>
    </Screen>
  )
}

export const EditPlaylistScreen = () => {
  const playlist = useSelectorWeb(getMetadata)
  const dispatchWeb = useDispatchWeb()
  const tracks = useSelectorWeb(getTracks)

  const coverArt = useCollectionCoverArt({
    id: playlist?.playlist_id,
    sizes: playlist?._cover_art_sizes ?? null,
    size: SquareSizes.SIZE_1000_BY_1000
  })

  const handleSubmit = useCallback(
    (values: PlaylistValues) => {
      if (!isEqual(playlist?.playlist_contents.track_ids, values.track_ids)) {
        dispatchWeb(
          orderPlaylist(
            playlist?.playlist_id,
            values.track_ids.map(({ track, time }) => ({ id: track, time }))
          )
        )
      }
      dispatchWeb(editPlaylist(playlist?.playlist_id, values))
      dispatchWeb(tracksActions.fetchLineupMetadatas())
    },
    [dispatchWeb, playlist]
  )

  if (!playlist) return null

  const { playlist_name, description } = playlist

  const initialValues = {
    playlist_name,
    description,
    artwork: { url: coverArt ?? '' },
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
