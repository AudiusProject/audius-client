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
import { moodMap } from 'utils/moods'

import styles from './TrackMetadataFields.module.css'

const MOODS = Object.keys(moodMap).map((k) => ({ text: k, el: moodMap[k] }))

const messages = {
  genre: 'Pick a Genre',
  mood: 'Pick a Mood',
  description: 'Description',
  public: 'Public (Default)',
  specialAccess: 'Special Access',
  collectibleGated: 'Collectible Gated',
  hidden: 'Hidden',
  thisIsARemix: 'This is a Remix',
  editRemix: 'Edit',
  trackVisibility: 'Track Visibility',
  availability: 'Availability'
}

type TrackMetadataFieldsProps = {
  /** Whether or not the preview is playing. */
  playing: boolean
  // type: 'track' | 'album' | 'playlist'
  type: 'track'
}

const TrackMetadataFields = (props: TrackMetadataFieldsProps) => {
  const [imageProcessingError, setImageProcessingError] = useState(false)
  const [artworkField] = useField('artwork')
  const [titleField, titleMeta] = useField('title')
  const [genreField, genreMeta] = useField('genre')
  const [moodField, moodMeta] = useField('mood')
  const [tagsField, tagsMeta] = useField('tags')
  const [descriptionField, descriptionMeta] = useField('description')

  const onPreviewClick = props.playing
    ? props.onStopPreview
    : props.onPlayPreview

  const onDropArtwork = async (selectedFiles, source) => {
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
        file.name = selectedFiles[0].name
      }
      const url = URL.createObjectURL(file)
      artworkField.onChange({ url, file, source })
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
            artworkUrl={artworkField.value}
            onDropArtwork={onDropArtwork}
            // error={props.invalidFields.artwork}
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
              // isRequired={}
              characterLimit={64}
              error={titleMeta.error}
              variant={'elevatedPlaceholder'}
              onChange={titleField.onChange}
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
              // isRequired={}
              error={genreMeta.error}
              onSelect={genreField.onChange}
              size='large'
            />
            <DropdownInput
              placeholder='Pick a Mood'
              mount='parent'
              menu={{ items: MOODS }}
              defaultValue={moodMeta.initialValue}
              // isRequired={}
              error={moodMeta.error}
              onSelect={moodField.onChange}
              size='large'
            />
          </div>
          <div className={styles.tags}>
            <TagInput
              defaultTags={(tagsMeta.initialValue || '')
                .split(',')
                .filter((t) => t)}
              onChangeTags={(value) => tagsField.onChange([...value].join(','))}
            />
          </div>
          <div className={styles.description}>
            <TextArea
              className={styles.textArea}
              placeholder='Description'
              defaultValue={descriptionMeta.initialValue || ''}
              onChange={descriptionField.onChange}
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
