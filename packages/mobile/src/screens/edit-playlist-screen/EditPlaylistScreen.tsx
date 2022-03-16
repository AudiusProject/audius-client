import { useCallback } from 'react'

import { useNavigation } from '@react-navigation/native'
import { SquareSizes } from 'audius-client/src/common/models/ImageSizes'
import {
  getMetadata,
  getTracks
} from 'common/store/ui/createPlaylistModal/selectors'
import { Formik, FormikProps } from 'formik'
import { View } from 'react-native'

import { Screen, TextButton, FormTextInput } from 'app/components/core'
import { useCollectionCoverArt } from 'app/hooks/useCollectionCoverArt'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'

import { PlaylistValues } from './types'

const messages = {
  save: 'Save',
  cancel: 'Cancel'
}

const EditPlaylistForm = (props: FormikProps<PlaylistValues>) => {
  const { handleSubmit, handleReset } = props
  const navigation = useNavigation()

  return (
    <Screen
      variant='secondary'
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
      <View style={{ paddingTop: 64 }}>
        <FormTextInput isFirstInput name='name' label='Name' />
        <FormTextInput
          name='description'
          label='Description'
          multiline
          maxLength={256}
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
    [dispatchWeb]
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
