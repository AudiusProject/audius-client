import { GENRES } from '@audius/common'

import { InputV2Variant } from 'components/data-entry/InputV2'
import {
  ArtworkField,
  DropdownField,
  TagField,
  TextAreaField,
  TextField
} from 'components/form-fields'
import { moodMap } from 'utils/Moods'

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
  index: number
}

export const TrackMetadataFields = (props: TrackMetadataFieldsProps) => {
  const { index } = props

  return (
    <div className={styles.basic}>
      <div className={styles.artwork}>
        <ArtworkField name={getTrackFieldName(index, 'artwork')} />
      </div>
      <div className={styles.fields}>
        <div className={styles.trackName}>
          <TextField
            name={getTrackFieldName(index, 'title')}
            variant={InputV2Variant.ELEVATED_PLACEHOLDER}
            label={`Track Name`}
            maxLength={64}
            required
          />
        </div>
        <div className={styles.categorization}>
          <DropdownField
            name={getTrackFieldName(index, 'genre')}
            aria-label={messages.genre}
            placeholder={messages.genre}
            mount='parent'
            menu={{ items: GENRES }}
            size='large'
          />
          <DropdownField
            name={getTrackFieldName(index, 'mood')}
            placeholder='Pick a Mood'
            mount='parent'
            menu={{ items: MOODS }}
            size='large'
          />
        </div>
        <div className={styles.tags}>
          <TagField name={getTrackFieldName(index, 'tags')} />
        </div>
        <div className={styles.description}>
          <TextAreaField
            name={getTrackFieldName(index, 'description')}
            className={styles.textArea}
            placeholder='Description'
            maxLength={1000}
            showMaxLength
          />
        </div>
      </div>
    </div>
  )
}
