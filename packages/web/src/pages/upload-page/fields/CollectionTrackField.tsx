import { useCallback, useEffect } from 'react'

import {
  HarmonyPlainButton,
  IconDrag,
  IconPlay,
  IconTrash
} from '@audius/stems'
import { useField } from 'formik'

import { Icon } from 'components/Icon'
import { TagField } from 'components/form-fields'
import { SwitchField } from 'components/form-fields/SwitchField'
import { Tile } from 'components/tile'
import { Text } from 'components/typography'

import { SelectGenreField } from '../fields/SelectGenreField'
import { SelectMoodField } from '../fields/SelectMoodField'
import { TrackNameField } from '../fields/TrackNameField'
import { CollectionTrackForUpload } from '../types'

import styles from './CollectionTrackField.module.css'

const messages = {
  overrideLabel: 'Override details for this track',
  preview: 'Preview',
  delete: 'Delete'
}

type CollectionTrackFieldProps = {
  index: number
  remove: (index: number) => void
  disableDelete: boolean
}

export const CollectionTrackField = (props: CollectionTrackFieldProps) => {
  const { disableDelete = false, index, remove } = props
  const [{ value: track }] = useField<CollectionTrackForUpload>(
    `tracks.${index}`
  )

  const [{ value: metadata }, , { setValue }] = useField<
    CollectionTrackForUpload['metadata']
  >(`tracks.${index}.metadata`)

  const [{ value }] = useField('trackDetails')

  const { override } = track

  useEffect(() => {
    if (override) {
      setValue({ ...metadata, ...value })
    } else {
      setValue({ ...metadata, genre: '', mood: null, tags: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [override])

  const handleRemove = useCallback(() => {
    remove(index)
  }, [remove, index])

  return (
    <Tile className={styles.root} key={track.metadata.track_id} elevation='mid'>
      <div className={styles.trackNameRow}>
        <span className={styles.iconDrag}>
          <Icon icon={IconDrag} size='large' />
        </span>
        <Text size='small' className={styles.trackindex}>
          {index + 1}
        </Text>
        <TrackNameField name={`tracks.${index}.metadata.title`} />
      </div>
      {override ? (
        <div className={styles.trackInformation}>
          <div className={styles.genreMood}>
            <SelectGenreField name={`tracks.${index}.metadata.genre`} />
            <SelectMoodField name={`tracks.${index}.metadata.mood`} />
          </div>
          <TagField name={`tracks.${index}.metadata.tags`} />
        </div>
      ) : null}
      <div className={styles.overrideRow}>
        <div className={styles.overrideSwitch}>
          <SwitchField name={`tracks.${index}.override`} />
          <Text>{messages.overrideLabel}</Text>
        </div>
        <div className={styles.actions}>
          <HarmonyPlainButton
            className={styles.actionButton}
            text={messages.preview}
            iconLeft={IconPlay}
          />
          <HarmonyPlainButton
            className={styles.actionButton}
            disabled={disableDelete}
            text={messages.delete}
            iconLeft={IconTrash}
            onClick={handleRemove}
          />
        </div>
      </div>
    </Tile>
  )
}
