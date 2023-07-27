import { useState } from 'react'

import { GENRES, getCanonicalName, getErrorMessage } from '@audius/common'
import { useField } from 'formik'

import DropdownInput from 'components/data-entry/DropdownInput'
import {
  InputV2,
  InputV2Size,
  InputV2Variant
} from 'components/data-entry/InputV2'
import TagInput from 'components/data-entry/TagInput'
import { TextAreaV2 } from 'components/data-entry/TextAreaV2'
import UploadArtwork from 'components/upload/UploadArtwork'
import { moodMap } from 'utils/Moods'
import { resizeImage } from 'utils/imageProcessingUtil'

import { getTrackFieldName } from '../forms/utils'

import styles from './TrackMetadataFields.module.css'

const MOODS = Object.keys(moodMap).map((k) => ({
  text: k,
  el: moodMap[k]
}))

const messages = {
  genre: 'Pick a Genre'
}

type TrackMetadataFieldsProps = {
  /** Whether or not the preview is playing. */
  playing: boolean
  type: 'track'
  index: number
}

const TrackMetadataFields = (props: TrackMetadataFieldsProps) => {
  const { index } = props
  const [imageProcessingError, setImageProcessingError] = useState(false)
  const [artworkField, , artworkHelpers] = useField(
    getTrackFieldName(index, 'artwork')
  )
  const [titleField] = useField(getTrackFieldName(index, 'title'))
  const [genreField, , genreHelpers] = useField({
    name: getTrackFieldName(index, 'genre'),
    type: 'select'
  })
  const [, moodMeta, moodHelpers] = useField(getTrackFieldName(index, 'mood'))
  const [, tagsMeta, tagsHelpers] = useField(getTrackFieldName(index, 'tags'))
  const [descriptionField] = useField(getTrackFieldName(index, 'description'))

  const onDropArtwork = async (selectedFiles: File[], source: string) => {
    try {
      let file = selectedFiles[0]
      file = await resizeImage(file)
      // @ts-ignore writing to read-only property. Maybe bugged?
      file.name = selectedFiles[0].name
      const url = URL.createObjectURL(file)
      artworkHelpers.setValue({ url, file, source })
      setImageProcessingError(false)
    } catch (err) {
      console.error(getErrorMessage(err))
      setImageProcessingError(true)
    }
  }

  return (
    <div className={styles.basic}>
      <div className={styles.artwork}>
        <UploadArtwork
          artworkUrl={artworkField.value?.url}
          onDropArtwork={onDropArtwork}
          imageProcessingError={imageProcessingError}
        />
      </div>
      <div className={styles.fields}>
        <div className={styles.trackName}>
          <InputV2
            id='track-name-input'
            variant={InputV2Variant.ELEVATED_PLACEHOLDER}
            label={`${
              props.type.charAt(0).toUpperCase() + props.type.slice(1)
            } Name`}
            size={InputV2Size.LARGE}
            // TODO: character limit in validation
            // characterLimit={64}
            {...titleField}
          />
        </div>
        <div className={styles.categorization}>
          <DropdownInput
            aria-label={messages.genre}
            placeholder={messages.genre}
            mount='parent'
            menu={{ items: GENRES }}
            defaultValue={getCanonicalName(genreField.value) || ''}
            size='large'
            {...genreField}
            onSelect={genreHelpers.setValue}
          />
          <DropdownInput
            placeholder='Pick a Mood'
            mount='parent'
            menu={{ items: MOODS }}
            defaultValue={moodMeta.initialValue}
            error={!!moodMeta.error}
            onSelect={moodHelpers.setValue}
            size='large'
          />
        </div>
        <div className={styles.tags}>
          <TagInput
            defaultTags={(tagsMeta.initialValue || '')
              .split(',')
              .filter((t: string | null) => t)}
            onChangeTags={(value: string[]) =>
              tagsHelpers.setValue([...value].join(','))
            }
          />
        </div>
        <div className={styles.description}>
          <TextAreaV2
            className={styles.textArea}
            placeholder='Description'
            // defaultValue={descriptionMeta.initialValue || ''}
            {...descriptionField}
          />
        </div>
      </div>
    </div>
  )
}

export default TrackMetadataFields
