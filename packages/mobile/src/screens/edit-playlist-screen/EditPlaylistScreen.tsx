import { useCallback } from 'react'

import { useNavigation } from '@react-navigation/native'
import { SquareSizes } from 'audius-client/src/common/models/ImageSizes'
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
import { View } from 'react-native'

import {
  Screen,
  TextButton,
  FormTextInput,
  FormImageInput
} from 'app/components/core'
import { useCollectionCoverArt } from 'app/hooks/useCollectionCoverArt'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { makeStyles } from 'app/styles'

import { PlaylistValues } from './types'

const messages = {
  title: 'Edit Playlist',
  descriptionPlaceholder: 'Give your playlist a description',
  save: 'Save',
  cancel: 'Cancel'
}

const useStyles = makeStyles(({ spacing }) => ({
  form: {
    paddingTop: spacing(8)
  },
  coverArtContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing(8)
  }
}))

const EditPlaylistForm = (props: FormikProps<PlaylistValues>) => {
  const { handleSubmit, handleReset } = props
  const navigation = useNavigation()
  const styles = useStyles()

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
      <View style={styles.form}>
        <View style={styles.coverArtContainer}>
          <FormImageInput name='cover_art' />
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
      </View>
    </Screen>
  )
}

export const EditPlaylistScreen = () => {
  const playlist = useSelectorWeb(getMetadata)
  const dispatchWeb = useDispatchWeb()

  const coverArt = useCollectionCoverArt({
    id: playlist?.playlist_id,
    sizes: playlist?._cover_art_sizes ?? null,
    size: SquareSizes.SIZE_1000_BY_1000
  })

  const handleSubmit = useCallback(
    (values: PlaylistValues) => {
      dispatchWeb(editPlaylist(playlist?.playlist_id, values))
      dispatchWeb(tracksActions.fetchLineupMetadatas())
      //   if (!profile) return
      //   const { cover_photo, profile_picture, ...restValues } = values
      //   // @ts-ignore typing is hard here, will come back
      //   const newProfile: UpdatedProfile = {
      //     ...profile,
      //     ...restValues
      //   }
      //   if (cover_photo.file) {
      //     newProfile.updatedCoverPhoto = cover_photo
      //   }
      //   if (profile_picture.file) {
      //     newProfile.updatedProfilePicture = cover_photo
      //   }
      //   dispatchWeb(updateProfile(newProfile as UserMetadata))
    },
    [dispatchWeb, playlist]
  )

  if (!playlist) return null

  const { playlist_name, description } = playlist

  const initialValues = {
    playlist_name,
    description,
    cover_art: { url: coverArt }
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      component={EditPlaylistForm}
    />
  )
}
