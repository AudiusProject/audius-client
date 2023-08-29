import { useCallback } from 'react'

import { UploadType } from '@audius/common'
import { HarmonyButton, IconUpload } from '@audius/stems'
import { Form, Formik } from 'formik'
import moment from 'moment'
import { toFormikValidationSchema } from 'zod-formik-adapter'

import {
  ArtworkField,
  TagField,
  TextAreaField,
  TextField
} from 'components/form-fields'
import { Tile } from 'components/tile'
import { Text } from 'components/typography'

import { CollectionTrackFieldArray } from '../fields/CollectionTrackFieldArray'
import { ReleaseDateField } from '../fields/ReleaseDateField'
import { SelectGenreField } from '../fields/SelectGenreField'
import { SelectMoodField } from '../fields/SelectMoodField'
import { CollectionFormState } from '../types'
import { AlbumSchema, CollectionValues, PlaylistSchema } from '../validation'

import styles from './EditCollectionForm.module.css'

const messages = {
  name: 'Name',
  description: 'Description',
  trackDetails: {
    title: 'Track Details',
    description:
      "Set defaults for all tracks in this collection. Use 'Override' to personalize individual track details."
  },
  completeButton: 'Complete Upload'
}

type EditCollectionFormProps = {
  formState: CollectionFormState
  onContinue: (formState: CollectionFormState) => void
}

export const EditCollectionForm = (props: EditCollectionFormProps) => {
  const { formState, onContinue } = props
  const { tracks, uploadType, metadata } = formState

  const initialValues: CollectionValues = {
    ...metadata,
    is_album: uploadType === UploadType.ALBUM,
    artwork: null,
    playlist_name: '',
    description: '',
    releaseDate: moment().startOf('day').toDate(),
    trackDetails: {
      genre: null,
      mood: null,
      tags: ''
    },
    // @ts-expect-error issues with track schema
    tracks: tracks.map((track) => ({ ...track, override: false }))
  }

  const handleSubmit = useCallback(
    (values: CollectionValues) => {
      const {
        tracks,
        trackDetails: ignoredTrackDetails,
        ...collectionMetadata
      } = values

      // @ts-expect-error more issues with tracks
      onContinue({ uploadType, tracks, metadata: collectionMetadata })
    },
    [onContinue, uploadType]
  )

  const collectionTypeName =
    uploadType === UploadType.ALBUM ? 'Album' : 'Playlist'

  const validationSchema =
    uploadType === UploadType.ALBUM ? AlbumSchema : PlaylistSchema

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      // @ts-ignore
      validationSchema={toFormikValidationSchema(validationSchema)}
    >
      <Form className={styles.root}>
        <Tile className={styles.collectionFields} elevation='mid'>
          <div className={styles.row}>
            <ArtworkField name='artwork' className={styles.artwork} />
            <div className={styles.collectionInfo}>
              <TextField
                name='playlist_name'
                label={`${collectionTypeName} ${messages.name}`}
                maxLength={64}
                required
              />
              <TextAreaField
                name='description'
                placeholder={`${collectionTypeName} ${messages.description}`}
                maxLength={1000}
                showMaxLength
                className={styles.description}
                grows
              />
            </div>
          </div>
          <ReleaseDateField />
          <div className={styles.trackDetails}>
            <Text variant='label'>{messages.trackDetails.title}</Text>
            <Text>{messages.trackDetails.description}</Text>
            <div className={styles.row}>
              <SelectGenreField name='trackDetails.genre' />
              <SelectMoodField name='trackDetails.mood' />
            </div>
            <TagField name='trackDetails.tags' />
          </div>
        </Tile>
        <CollectionTrackFieldArray />
        <HarmonyButton
          text={messages.completeButton}
          iconLeft={IconUpload}
          type='submit'
        />
      </Form>
    </Formik>
  )
}
