import React, { useEffect, useState } from 'react'

import { Button, ButtonType, IconCheck } from '@audius/stems'
import { debounce } from 'lodash'

import { Collection, CollectionMetadata } from 'common/models/Collection'
import { SquareSizes } from 'common/models/ImageSizes'
import { Nullable, DeepNullable } from 'common/utils/typeUtils'
import Input from 'components/data-entry/Input'
import TextArea from 'components/data-entry/TextArea'
import UploadArtwork from 'components/upload/UploadArtwork'
import { useCollectionCoverArt } from 'hooks/useCollectionCoverArt'
import * as schemas from 'schemas'
import { resizeImage } from 'utils/imageProcessingUtil'

import styles from './PlaylistForm.module.css'

const messages = {
  editPlaylistButtonText: 'Save Changes',
  cancelButtonText: 'Cancel',
  deletePlaylistButtonText: 'Delete Playlist',
  deleteAlbumButtonText: 'Delete Album',
  createPlaylistButtonText: 'Create Playlist'
}

type PlaylistFormFields = Partial<Collection> & {
  artwork: {
    file: Blob
    url: string
    source: 'unsplash' | 'original'
    error?: string
  }
  is_current: boolean
  mood: Nullable<string>
  created_at: Nullable<string>
  tags: Nullable<string>
  genre: Nullable<string>
  isAlbum: boolean
} & DeepNullable<
    Pick<
      CollectionMetadata,
      | 'is_private'
      | 'updated_at'
      | 'cover_art'
      | 'cover_art_sizes'
      | 'playlist_name'
      | 'playlist_owner_id'
      | 'save_count'
      | 'upc'
      | 'description'
    >
  >

type PlaylistFormProps = {
  metadata?: Nullable<Collection>
  isAlbum?: boolean
  onOpenArtworkPopup?: () => void
  onCloseArtworkPopup?: () => void
  isEditMode?: boolean
  /** Only applies to edit mode */
  onDelete?: () => void
  /** Only applies to edit mode */
  onCancel?: () => void
  onSave: (formFields: PlaylistFormFields) => void
}

const EditPlaylistActions = ({
  isAlbum,
  onDelete,
  onCancel,
  onSave
}: {
  isAlbum: boolean
  onDelete?: () => void
  onCancel?: () => void
  onSave: () => void
}) => {
  return (
    <div className={styles.editPlaylistActionsContainer}>
      <div>
        <Button
          text={
            isAlbum
              ? messages.deleteAlbumButtonText
              : messages.deletePlaylistButtonText
          }
          type={ButtonType.SECONDARY}
          onClick={onDelete}
          className={styles.deleteButton}
          textClassName={styles.deleteButtonText}
        />
      </div>
      <div>
        <Button
          text={messages.cancelButtonText}
          type={ButtonType.SECONDARY}
          className={styles.cancelButton}
          textClassName={styles.cancelButtonText}
          onClick={onCancel}
        />
        <Button
          className={styles.saveChangesButton}
          text={messages.editPlaylistButtonText}
          type={ButtonType.SECONDARY}
          onClick={debounce(onSave, 500, { leading: true })}
        />
      </div>
    </div>
  )
}

const CreatePlaylistActions = ({ onSave }: { onSave: () => void }) => {
  return (
    <div className={styles.createPlaylistActionsContainer}>
      <Button
        rightIcon={<IconCheck />}
        text={messages.createPlaylistButtonText}
        type={ButtonType.PRIMARY}
        onClick={debounce(onSave, 500, { leading: true })}
      ></Button>
    </div>
  )
}

const PlaylistForm = ({
  isAlbum = false,
  metadata,
  onSave: onSaveParent,
  onCancel,
  onDelete,
  onOpenArtworkPopup,
  onCloseArtworkPopup,
  isEditMode = false
}: PlaylistFormProps) => {
  const [formFields, setFormFields] = useState<PlaylistFormFields>({
    artwork: {},
    ...schemas.newCollectionMetadata(metadata)
  })
  const [errors, setErrors] = useState({
    playlistName: false,
    artwork: false
  })

  const coverArt = useCollectionCoverArt(
    formFields.playlist_id,
    formFields?._cover_art_sizes ? formFields._cover_art_sizes : null,
    SquareSizes.SIZE_1000_BY_1000
  )

  // On receiving new, defined metadata, update the form fields
  useEffect(() => {
    if (metadata) {
      setFormFields(oldFormFields => ({
        ...schemas.newCollectionMetadata(metadata),
        artwork: oldFormFields.artwork,
        playlist_name: oldFormFields.playlist_name,
        description: oldFormFields.description
      }))
    }
  }, [metadata])

  const onDropArtwork = async (selectedFiles: any, source: any) => {
    setErrors({
      ...errors,
      artwork: false
    })
    try {
      let file = selectedFiles[0]
      file = await resizeImage(file)
      const url = URL.createObjectURL(file)
      setFormFields((formFields: PlaylistFormFields) => ({
        ...formFields,
        artwork: { file, url, source }
      }))
    } catch (err) {
      setFormFields((formFields: PlaylistFormFields) => ({
        ...formFields,
        artwork: {
          ...(formFields.artwork || {}),
          error: err instanceof Error ? err.message : 'Unknown error'
        }
      }))
    }
  }

  const onChangePlaylistName = (name: string) => {
    setFormFields((formFields: PlaylistFormFields) => ({
      ...formFields,
      playlist_name: name
    }))
    if (name) {
      setErrors({ ...errors, playlistName: false })
    }
  }

  const onChangeDescription = (description: string) => {
    setFormFields((formFields: PlaylistFormFields) => ({
      ...formFields,
      description
    }))
  }

  const onSave = () => {
    if (!formFields.playlist_name || (!formFields.artwork.file && !coverArt)) {
      setErrors({
        ...errors,
        artwork: !formFields.artwork.file && !coverArt,
        playlistName: !formFields.playlist_name
      })
    } else {
      onSaveParent(formFields)
    }
  }

  return (
    <div>
      <div className={styles.playlistForm}>
        <UploadArtwork
          artworkUrl={formFields.artwork.url || coverArt}
          onDropArtwork={onDropArtwork}
          error={errors.artwork}
          imageProcessingError={Boolean(formFields.artwork.error)}
          onOpenPopup={onOpenArtworkPopup}
          onClosePopup={onCloseArtworkPopup}
        />
        <div className={styles.form}>
          <Input
            variant='elevatedPlaceholder'
            placeholder={`${isAlbum ? 'Album' : 'Playlist'} Name`}
            defaultValue={formFields.playlist_name || ''}
            error={errors.playlistName}
            onChange={onChangePlaylistName}
            characterLimit={64}
          />
          <TextArea
            className={styles.description}
            placeholder='Description'
            onChange={onChangeDescription}
            defaultValue={formFields.description || ''}
          />
        </div>
      </div>

      {isEditMode ? (
        <EditPlaylistActions
          isAlbum={isAlbum}
          onCancel={onCancel}
          onDelete={onDelete}
          onSave={onSave}
        />
      ) : (
        <CreatePlaylistActions onSave={onSave} />
      )}
    </div>
  )
}

export default PlaylistForm
