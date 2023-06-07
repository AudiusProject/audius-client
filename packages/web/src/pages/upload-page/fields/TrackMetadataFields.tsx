import {
  GENRES,
  ELECTRONIC_PREFIX,
  getCanonicalName,
  FeatureFlags
} from '@audius/common'

import DropdownInput from 'components/data-entry/DropdownInput'
import Input from 'components/data-entry/Input'
import TagInput from 'components/data-entry/TagInput'
import TextArea from 'components/data-entry/TextArea'
import PreviewButton from 'components/upload/PreviewButton'
import UploadArtwork from 'components/upload/UploadArtwork'
import { getFeatureEnabled } from 'services/remote-config/featureFlagHelpers'
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
  /** The image returned from useTrackCoverArt */
  coverArt: string
  /** If image processing resulted in an error. */
  imageProcessingError: boolean
  isPlaylist: boolean
  onChangeOrder: Function
  /** Whether or not to show a preview button. */
  showPreview: boolean
  /** Whether or not the preview is playing. */
  playing: boolean
  type: 'track' | 'album' | 'playlist'
  /** Transform artwork function to apply. */
  transformArtworkFunction: Function

  /** callback when artwork popup is opened */
  onOpenArtworkPopup: Function

  /** callback when artwork popup is closed */
  onCloseArtworkPopup: Function
}

const TrackMetadataFields = (props: TrackMetadataFieldsProps) => {
  const onPreviewClick = props.playing
    ? props.onStopPreview
    : props.onPlayPreview

  const onDropArtwork = async (selectedFiles, source) => {
    try {
      let file = selectedFiles[0]
      file = await this.props.transformArtworkFunction(file)
      const storageV2SignupEnabled = await getFeatureEnabled(
        FeatureFlags.STORAGE_V2_SIGNUP
      )
      const storageV2UploadEnabled = await getFeatureEnabled(
        FeatureFlags.STORAGE_V2_TRACK_UPLOAD
      )
      if (storageV2SignupEnabled || storageV2UploadEnabled) {
        file.name = selectedFiles[0].name
      }
      const url = URL.createObjectURL(file)
      this.props.onChangeField('artwork', { url, file, source }, false)
      this.setState({ imageProcessingError: false })
    } catch (err) {
      const {
        defaultFields: { artwork }
      } = this.props
      this.props.onChangeField('artwork', { ...artwork }, false)
      this.setState({ imageProcessingError: true })
    }
  }

  const renderBasicForm = () => {
    return (
      <div className={styles.basic}>
        <div className={styles.preview}>
          <UploadArtwork
            artworkUrl={
              props.defaultFields.artwork
                ? props.defaultFields.artwork.url
                : props.coverArt
            }
            onDropArtwork={props.onDropArtwork}
            error={props.invalidFields.artwork}
            imageProcessingError={props.imageProcessingError}
            onOpenPopup={props.onOpenArtworkPopup}
            onClosePopup={props.onCloseArtworkPopup}
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
              defaultValue={
                props.isPlaylist
                  ? props.defaultFields.playlist_name
                  : props.defaultFields.title
              }
              isRequired={
                props.isPlaylist
                  ? props.requiredFields.playlist_name
                  : props.requiredFields.title
              }
              characterLimit={64}
              error={
                props.isPlaylist
                  ? props.invalidFields.playlist_name
                  : props.invalidFields.title
              }
              variant={'elevatedPlaceholder'}
              onChange={(value) =>
                props.onChangeField(
                  props.isPlaylist ? 'playlist_name' : 'title',
                  value
                )
              }
            />
          </div>
          <div className={styles.categorization}>
            <DropdownInput
              aria-label={messages.genre}
              placeholder={messages.genre}
              mount='parent'
              menu={{ items: GENRES }}
              defaultValue={getCanonicalName(props.defaultFields.genre) || ''}
              isRequired={props.requiredFields.genre}
              error={props.invalidFields.genre}
              onSelect={(value) =>
                props.onChangeField(
                  'genre',
                  value.replace(ELECTRONIC_PREFIX, '')
                )
              }
              size='large'
            />
            <DropdownInput
              placeholder='Pick a Mood'
              mount='parent'
              menu={{ items: MOODS }}
              defaultValue={props.defaultFields.mood || ''}
              isRequired={props.requiredFields.mood}
              error={props.invalidFields.mood}
              onSelect={(value) => props.onChangeField('mood', value)}
              size='large'
            />
          </div>
          <div className={styles.tags}>
            <TagInput
              defaultTags={(props.defaultFields.tags || '')
                .split(',')
                .filter((t) => t)}
              onChangeTags={(value) =>
                props.onChangeField('tags', [...value].join(','))
              }
            />
          </div>
          <div className={styles.description}>
            <TextArea
              className={styles.textArea}
              placeholder='Description'
              defaultValue={props.defaultFields.description || ''}
              onChange={(value) => props.onChangeField('description', value)}
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
        {props.type === 'track' && props.showPreview ? (
          <div>
            <PreviewButton playing={props.playing} onClick={onPreviewClick} />
          </div>
        ) : null}
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
