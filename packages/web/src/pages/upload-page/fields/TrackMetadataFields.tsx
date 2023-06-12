import { useState } from 'react'

import { GENRES, getCanonicalName, FeatureFlags } from '@audius/common'
import { useField } from 'formik'

import DropdownInput from 'components/data-entry/DropdownInput'
import Input from 'components/data-entry/Input'
import TagInput from 'components/data-entry/TagInput'
import TextArea from 'components/data-entry/TextArea'
import PreviewButton from 'components/upload/PreviewButton'
import UploadArtwork from 'components/upload/UploadArtwork'
import { getFeatureEnabled } from 'services/remote-config/featureFlagHelpers'
import { resizeImage } from 'utils/imageProcessingUtil'
import { moodMap as untypedMoodMap } from 'utils/moods'

import styles from './TrackMetadataFields.module.css'

const moodMap: Record<string, JSX.Element> = untypedMoodMap
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
  // type: 'track' | 'album' | 'playlist'
  type: 'track'
}

const TrackMetadataFields = (props: TrackMetadataFieldsProps) => {
  const [imageProcessingError, setImageProcessingError] = useState(false)
  const [artworkField, , artworkHelpers] = useField('artwork')
  const [titleField, titleMeta, titleHelpers] = useField('title')
  const [genreField, genreMeta, genreHelpers] = useField('genre')
  const [, moodMeta, moodHelpers] = useField('mood')
  const [, tagsMeta, tagsHelpers] = useField('tags')
  const [, descriptionMeta, descriptionHelpers] = useField('description')

  // TODO: implement preview
  const onPreviewClick = () => {}

  const onDropArtwork = async (selectedFiles: File[], source: string) => {
    try {
      let file = selectedFiles[0]
      file = await resizeImage(file)
      const storageV2SignupEnabled = getFeatureEnabled(
        FeatureFlags.STORAGE_V2_SIGNUP
      )
      const storageV2UploadEnabled = getFeatureEnabled(
        FeatureFlags.STORAGE_V2_TRACK_UPLOAD
      )
      if (storageV2SignupEnabled || storageV2UploadEnabled) {
        // @ts-ignore
        file.name = selectedFiles[0].name
      }
      const url = URL.createObjectURL(file)
      artworkHelpers.setValue({ url, file, source })
      setImageProcessingError(false)
    } catch (err) {
      setImageProcessingError(true)
    }
  }

  const renderBasicForm = () => {
    return (
      <div className={styles.basic}>
        <div className={styles.preview}>
          <UploadArtwork
            artworkUrl={artworkField.value?.url}
            onDropArtwork={onDropArtwork}
            imageProcessingError={imageProcessingError}
          />
        </div>
        <div className={styles.form}>
          <div className={styles.trackName}>
            <Input
              name='name'
              id='track-name-input'
              placeholder={`${
                props.type.charAt(0).toUpperCase() + props.type.slice(1)
              } Name`}
              defaultValue={titleMeta.initialValue}
              characterLimit={64}
              error={!!titleMeta.error}
              variant={'elevatedPlaceholder'}
              onChange={titleHelpers.setValue}
              onBlur={titleField.onBlur}
            />
          </div>
          <div className={styles.categorization}>
            <DropdownInput
              aria-label={messages.genre}
              placeholder={messages.genre}
              mount='parent'
              menu={{ items: GENRES }}
              defaultValue={getCanonicalName(genreField.value) || ''}
              error={!!genreMeta.error}
              onSelect={genreHelpers.setValue}
              size='large'
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
            <TextArea
              className={styles.textArea}
              placeholder='Description'
              defaultValue={descriptionMeta.initialValue || ''}
              onChange={descriptionHelpers.setValue}
              characterLimit={1000}
            />
          </div>
        </div>
      </div>
    )
  }

  const renderBottomMenu = () => {
    return (
      <div className={styles.menu}>
        <div>
          <PreviewButton playing={props.playing} onClick={onPreviewClick} />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.basicContainer}>
      {renderBasicForm()}
      {renderBottomMenu()}
    </div>
  )
}

export default TrackMetadataFields
