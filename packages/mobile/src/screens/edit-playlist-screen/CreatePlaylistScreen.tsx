import { useCallback } from 'react'

import { CreatePlaylistSource } from 'audius-client/src/common/models/Analytics'
import { createPlaylist } from 'audius-client/src/common/store/cache/collections/actions'
import { Formik, FormikProps } from 'formik'

import { FormScreen } from 'app/components/form-screen'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'

import { PlaylistDescriptionInput } from './PlaylistDescriptionInput'
import { PlaylistImageInput } from './PlaylistImageInput'
import { PlaylistNameInput } from './PlaylistNameInput'

const messages = {
  title: 'Create Playlist'
}

type PlaylistValues = {
  playlist_name: string
  description: string
  artwork: { url: string }
}

const CreatePlaylistForm = (props: FormikProps<PlaylistValues>) => {
  const { handleSubmit, handleReset, errors } = props

  return (
    <FormScreen
      title={messages.title}
      onSubmit={handleSubmit}
      onReset={handleReset}
      errors={errors}
    >
      <PlaylistImageInput />
      <PlaylistNameInput />
      <PlaylistDescriptionInput />
    </FormScreen>
  )
}

const initialValues: PlaylistValues = {
  playlist_name: '',
  description: '',
  artwork: { url: '' }
}

const initialErrors = {
  playlist_name: 'Required'
}

export const CreatePlaylistScreen = () => {
  const dispatchWeb = useDispatchWeb()
  const handleSubmit = useCallback(
    (values: PlaylistValues) => {
      dispatchWeb(
        createPlaylist(
          Date.now().toString(),
          values,
          CreatePlaylistSource.FAVORITES_PAGE
        )
      )
    },
    [dispatchWeb]
  )

  return (
    <Formik
      initialValues={initialValues}
      initialErrors={initialErrors}
      onSubmit={handleSubmit}
      component={CreatePlaylistForm}
    />
  )
}
