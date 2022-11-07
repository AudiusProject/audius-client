import { useCallback } from 'react'

import type { FormikProps } from 'formik'
import { Formik } from 'formik'
import * as Yup from 'yup'

import IconArrow from 'app/assets/images/iconArrow.svg'
import IconRemove from 'app/assets/images/iconRemove.svg'
import IconUpload from 'app/assets/images/iconUpload.svg'
import { Button, ScrollView, Tile } from 'app/components/core'
import { InputErrorMessage } from 'app/components/core/InputErrorMessage'
import { useNavigation } from 'app/hooks/useNavigation'
import { useRoute } from 'app/hooks/useRoute'
import { makeStyles } from 'app/styles'

import { TopBarIconButton } from '../app-screen'

import { UploadStackScreen } from './UploadStackScreen'
import { PickArtworkField, SelectGenreField, TextField } from './fields'
import type { UploadTrack, UploadTrackMetadata } from './types'

const messages = {
  screenTitle: 'Complete Track',
  name: 'Track Name',
  description: 'Description',
  continue: 'Continue',
  fixErrors: 'Fix Errors To Continue'
}

const useStyles = makeStyles(({ spacing }) => ({
  tile: {
    margin: spacing(3)
  },
  tileContent: {
    padding: spacing(4)
  }
}))

const CompleteTrackSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  artwork: Yup.object({
    url: Yup.string().nullable().required('Required')
  }),
  genre: Yup.string().required('Required'),
  description: Yup.string().nullable()
})

export type CompleteTrackParams = UploadTrack

const CompleteTrackForm = (props: FormikProps<UploadTrackMetadata>) => {
  const { handleSubmit, isSubmitting, errors, touched } = props
  const errorsKeys = Object.keys(errors)
  const hasErrors =
    errorsKeys.length > 0 && errorsKeys.every((errorKey) => touched[errorKey])
  const styles = useStyles()
  const navigation = useNavigation()

  const handleBack = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  return (
    <UploadStackScreen
      title={messages.screenTitle}
      icon={IconUpload}
      topbarLeft={<TopBarIconButton icon={IconRemove} onPress={handleBack} />}
      bottomSection={
        <>
          {hasErrors ? (
            <InputErrorMessage message={messages.fixErrors} />
          ) : null}
          <Button
            variant='primary'
            size='large'
            icon={IconArrow}
            fullWidth
            title={messages.continue}
            onPress={() => handleSubmit()}
            disabled={isSubmitting || hasErrors}
          />
        </>
      }
    >
      <ScrollView>
        <Tile styles={{ root: styles.tile, content: styles.tileContent }}>
          <PickArtworkField />
          <TextField name='title' label={messages.name} required />
          <TextField name='description' label={messages.description} />
          <SelectGenreField />
        </Tile>
      </ScrollView>
    </UploadStackScreen>
  )
}

export const CompleteTrackScreen = () => {
  const { params } = useRoute<'CompleteTrack'>()
  const { metadata, file } = params
  const navigation = useNavigation()

  const initialValues = metadata

  const handleSubmit = useCallback(
    (values) => {
      navigation.push('UploadingTracks', {
        tracks: [{ file, metadata: { ...metadata, ...values } }]
      })
    },
    [navigation, file, metadata]
  )

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      component={CompleteTrackForm}
      validationSchema={CompleteTrackSchema}
    />
  )
}
