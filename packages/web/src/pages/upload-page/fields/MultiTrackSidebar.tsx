import { useCallback } from 'react'

import { imageBlank as placeholderArt } from '@audius/common'
import {
  HarmonyButton,
  HarmonyButtonType,
  IconError,
  IconUpload
} from '@audius/stems'
import cn from 'classnames'
import { useField, useFormikContext } from 'formik'
import { isEmpty } from 'lodash'

import { ReactComponent as IconTrash } from 'assets/img/iconTrash.svg'
import { Icon } from 'components/Icon'
import layoutStyles from 'components/layout/layout.module.css'
import { Text } from 'components/typography'

import { SingleTrackEditValues, TrackEditFormValues } from '../forms/types'
import { useIndexedField } from '../forms/utils'

import styles from './MultiTrackSidebar.module.css'

const messages = {
  title: 'UPLOADED TRACKS',
  complete: 'Complete Upload',
  titleRequired: 'Track name required'
}

export const MultiTrackSidebar = () => {
  return (
    <div className={styles.root}>
      <div className={cn(layoutStyles.col)}>
        <div className={styles.title}>
          <Text variant='title' size='xSmall'>
            {messages.title}
          </Text>
        </div>
        <div className={cn(styles.body, layoutStyles.col, layoutStyles.gap2)}>
          <TrackNavigator />
          <div className={styles.completeButton}>
            <HarmonyButton
              text={messages.complete}
              variant={HarmonyButtonType.PRIMARY}
              iconRight={IconUpload}
              fullWidth
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const TrackNavigator = () => {
  const [{ value: tracks }] =
    useField<TrackEditFormValues['trackMetadatas']>('trackMetadatas')
  return (
    <div className={cn(styles.tracks, layoutStyles.col)}>
      {tracks.map((track, i) => (
        <TrackRow key={i} index={i} />
      ))}
    </div>
  )
}

type TrackRowProps = {
  index: number
}

const TrackRow = (props: TrackRowProps) => {
  const { index } = props
  const { values, setValues, errors } = useFormikContext<TrackEditFormValues>()
  const [{ value: title }] = useIndexedField<SingleTrackEditValues['title']>(
    'trackMetadatas',
    index,
    'title'
  )
  const [{ value: artworkUrl }] = useIndexedField<string>(
    `trackMetadatas`,
    index,
    'artwork.url'
  )
  const [{ value: selectedIndex }, , { setValue: setIndex }] = useField(
    'trackMetadatasIndex'
  )
  const isSelected = index === selectedIndex

  const handleRemoveTrack = useCallback(
    (index: number) => {
      const newTrackMetadatas = [...values.trackMetadatas]
      newTrackMetadatas.splice(index, 1)
      const newIndex = selectedIndex === index ? Math.max(index - 1, 0) : index
      setValues({
        ...values,
        trackMetadatas: newTrackMetadatas,
        trackMetadatasIndex: newIndex
      })
    },
    [selectedIndex, setValues, values]
  )

  const isTitleMissing = isEmpty(title)
  // const hasError = !isEmpty(errors.trackMetadatas?.[index])
  const hasError = index === 1

  return (
    <div className={styles.trackRoot} onClick={() => setIndex(index)}>
      {isSelected ? <div className={styles.selectedIndicator} /> : null}
      <div className={cn(styles.track, layoutStyles.row)}>
        <div
          className={cn(styles.trackInfo, layoutStyles.row, layoutStyles.gap3, {
            [styles.selected]: isSelected,
            [styles.error]: hasError
          })}
        >
          <div className={layoutStyles.row}>
            {hasError ? (
              <Icon
                className={styles.iconError}
                icon={IconError}
                size='xSmall'
                color='accentRed'
              />
            ) : (
              <Text
                className={styles.trackIndex}
                color={isSelected ? '--secondary' : '--neutral'}
              >
                {index + 1}
              </Text>
            )}
            <div
              className={styles.artwork}
              style={{
                backgroundImage: `url(${artworkUrl || placeholderArt})`
              }}
            />
          </div>
          <Text
            size='small'
            // TODO: support for accent-red in other themes
            // @ts-ignore
            color={
              hasError
                ? '--accent-red'
                : isSelected
                ? '--secondary'
                : '--neutral'
            }
          >
            {isTitleMissing ? messages.titleRequired : title}
          </Text>
        </div>
        {values.trackMetadatas.length > 1 ? (
          <div className={styles.iconRemove}>
            <IconTrash
              fill='--default'
              onClick={() => handleRemoveTrack(index)}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
