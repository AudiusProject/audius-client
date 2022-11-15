import { useCallback, useEffect } from 'react'

import type { TrackMetadata, UploadTrack } from '@audius/common'
import { useRoute } from '@react-navigation/native'
import type { FormikProps } from 'formik'
import { Formik } from 'formik'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as Yup from 'yup'

import IconArrow from 'app/assets/images/iconArrow.svg'
import IconCaretRight from 'app/assets/images/iconCaretRight.svg'
import IconUpload from 'app/assets/images/iconUpload.svg'
import { Button, Tile } from 'app/components/core'
import { InputErrorMessage } from 'app/components/core/InputErrorMessage'
import { useNavigation } from 'app/hooks/useNavigation'
import { makeStyles } from 'app/styles'

import { TopBarIconButton } from '../app-screen'

import { CompleteTrackStack } from './CompleteTrackStack'
import type { UploadParamList, UploadRouteProp } from './ParamList'
import { UploadStackScreen } from './UploadStackScreen'
import {
  PickArtworkField,
  SelectGenreField,
  TextField,
  DescriptionField,
  SelectMoodField,
  TagField,
  SubmenuList,
  RemixSettingsField,
  AdvancedOptionsField
} from './fields'

const messages = {
  screenTitle: 'Complete Track',
  name: 'Track Name',
  continue: 'Continue',
  fixErrors: 'Fix Errors To Continue',
  trackNameError: 'Track Name Required'
}

const useStyles = makeStyles(({ spacing }) => ({
  backButton: {
    transform: [{ rotate: '180deg' }]
  },
  tile: {
    margin: spacing(3)
  },
  errorText: {
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: spacing(4)
  }
}))

const CompleteTrackSchema = Yup.object().shape({
  title: Yup.string().required('Required'),
  artwork: Yup.object({
    url: Yup.string().nullable().required('Required')
  }),
  genre: Yup.string().required('Required'),
  description: Yup.string().max(1000).nullable()
})

export type CompleteTrackParams = UploadTrack

export const CompleteTrackForm = (props: FormikProps<TrackMetadata>) => {
  const { handleSubmit, isSubmitting, errors, touched } = props
  const errorsKeys = Object.keys(errors)
  const hasErrors =
    errorsKeys.length > 0 && errorsKeys.every((errorKey) => touched[errorKey])
  const styles = useStyles()
  const navigation = useNavigation()

  return (
    <UploadStackScreen
      title={messages.screenTitle}
      icon={IconUpload}
      topbarLeft={
        <TopBarIconButton
          icon={IconCaretRight}
          style={styles.backButton}
          onPress={navigation.goBack}
        />
      }
      bottomSection={
        <>
          {hasErrors ? (
            <InputErrorMessage
              message={messages.fixErrors}
              style={styles.errorText}
            />
          ) : null}
          <Button
            variant='primary'
            size='large'
            icon={IconArrow}
            fullWidth
            title={messages.continue}
            onPress={() => {
              handleSubmit()
            }}
            disabled={isSubmitting || hasErrors}
          />
        </>
      }
    >
      <KeyboardAwareScrollView>
        <Tile style={styles.tile}>
          <PickArtworkField />
          <TextField
            name='title'
            label={messages.name}
            required
            errorMessage={messages.trackNameError}
          />
          <SubmenuList>
            <SelectGenreField />
            <SelectMoodField />
          </SubmenuList>
          <TagField />
          <DescriptionField />
          <SubmenuList removeBottomDivider>
            <RemixSettingsField />
            <AdvancedOptionsField />
          </SubmenuList>
        </Tile>
      </KeyboardAwareScrollView>
    </UploadStackScreen>
  )
}

export const CompleteTrackScreen = () => {
  const { params } = useRoute<UploadRouteProp<'CompleteTrack'>>()
  const { metadata, file } = params
  const navigation = useNavigation<UploadParamList>()

  const initialValues = {
    ...metadata,
    licenseType: {
      allowAttribution: false,
      commercialUse: false,
      derivativeWorks: false
    }
  }

  const handleSubmit = useCallback(
    (values) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { licenseType, ...trackValues } = values
      navigation.push('UploadingTracks', {
        tracks: [
          { file, preview: null, metadata: { ...metadata, ...trackValues } }
        ]
      })
    },
    [navigation, file, metadata]
  )

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      component={CompleteTrackStack}
      validationSchema={CompleteTrackSchema}
    />
  )
}
