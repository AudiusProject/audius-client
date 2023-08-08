import { useCallback } from 'react'

import { EditPlaylistValues, Nullable } from '@audius/common'
import { IconDrag } from '@audius/stems'
import { FieldArray, Form, Formik } from 'formik'
import { capitalize } from 'lodash'
import moment from 'moment'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'

import { Icon } from 'components/Icon'
import {
  ArtworkField,
  TagField,
  TextAreaField,
  TextField
} from 'components/form-fields'
import { Tile } from 'components/tile'
import { Text } from 'components/typography'

import { TrackForUpload } from '../components/types'
import { ReleaseDateField } from '../fields/ReleaseDateField'
import { SelectGenreField } from '../fields/SelectGenreField'
import { SelectMoodField } from '../fields/SelectMoodField'
import { TrackNameField } from '../fields/TrackNameField'

import styles from './UploadCollectionForm.module.css'

const messages = {
  name: 'Name',
  description: 'Description',
  trackDetails: {
    title: 'Track Details',
    description:
      "Set defaults for all tracks in this collection. Use 'Override' to personalize individual track details."
  }
}

type UploadCollectionFormProps = {
  collectionType: 'album' | 'playlist'
  tracks: TrackForUpload[]
  onSubmit: () => void
}

type TrackValues = TrackForUpload & {
  override: boolean
}

type CollectionValues = Pick<
  EditPlaylistValues,
  'artwork' | 'playlist_name' | 'description'
> & {
  releaseDate: string
  trackDetails: {
    genre: Nullable<string>
    mood: Nullable<string>
    tags: string
  }
  tracks: TrackValues[]
}

export const UploadCollectionForm = (props: UploadCollectionFormProps) => {
  const { collectionType, tracks, onSubmit } = props

  const initialValues: CollectionValues = {
    artwork: { url: '' },
    playlist_name: '',
    description: '',
    releaseDate: moment().startOf('day').toString(),
    trackDetails: {
      genre: null,
      mood: null,
      tags: ''
    },
    tracks: tracks.map((track) => ({ ...track, override: false }))
  }

  const handleSubmit = useCallback(
    (values: CollectionValues) => {
      console.log('submitting', values)
      onSubmit()
    },
    [onSubmit]
  )

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values }) => {
        return (
          <Form className={styles.root}>
            <Tile className={styles.collectionFields}>
              <div className={styles.row}>
                <ArtworkField name='artwork' className={styles.artwork} />
                <div className={styles.collectionInfo}>
                  <TextField
                    name='playlist_name'
                    label={`${capitalize(collectionType)} ${messages.name}`}
                    required
                  />
                  <TextAreaField
                    name='description'
                    placeholder={`${capitalize(collectionType)} ${
                      messages.description
                    }`}
                    maxLength={1000}
                    showMaxLength
                    className={styles.description}
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
            <FieldArray name='tracks'>
              {(stuff) => {
                return (
                  <DragDropContext
                    onDragEnd={(result) => {
                      if (!result.destination) {
                        return
                      }
                      stuff.move(result.source.index, result.destination.index)
                    }}
                  >
                    <Droppable droppableId='tracks'>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {values.tracks.map((track, index) => (
                            <Draggable
                              key={track.metadata.title}
                              draggableId={track.metadata.title}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <Tile
                                    className={styles.trackField}
                                    key={track.metadata.track_id}
                                    elevation='mid'
                                  >
                                    <div className={styles.trackNameRow}>
                                      <Icon icon={IconDrag} size='large' />
                                      <Text size='small'>{index}</Text>
                                      <TrackNameField
                                        name={`tracks.${index}.metadata.title`}
                                      />
                                    </div>
                                    <div className={styles.overrideRow}></div>
                                  </Tile>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )
              }}
            </FieldArray>
          </Form>
        )
      }}
    </Formik>
  )
}
