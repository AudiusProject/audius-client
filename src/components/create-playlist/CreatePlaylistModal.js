import React, { memo, useState, useEffect } from 'react'
import { debounce } from 'lodash'
import PropTypes from 'prop-types'
import { Button, ButtonSize, ButtonType } from '@audius/stems'

import * as schemas from 'schemas'
import { resizeImage } from 'utils/imageProcessingUtil'

import Modal from 'components/general/Modal'
import UploadArtwork from 'components/upload/UploadArtwork'
import Input from 'components/data-entry/Input'
import TextArea from 'components/data-entry/TextArea'
import styles from './CreatePlaylistModal.module.css'
import { useCollectionCoverArt } from 'hooks/useImageSize'
import { SquareSizes } from 'models/common/ImageSizes'

const initialFormFields = {
  artwork: {},
  ...schemas.newCollectionMetadata()
}

const CreatePlaylistModal = props => {
  const [formFields, setFormFields] = useState(initialFormFields)
  const [errors, setErrors] = useState({
    playlistName: false,
    artwork: false
  })

  const { visible, metadata, editMode } = props

  // On modal open (similar to componentDidMount, but this component is mounted before being displayed)
  useEffect(() => {
    if (visible) {
      setFormFields(_ => ({
        artwork: {},
        ...schemas.newCollectionMetadata(metadata)
      }))

      return () => {
        if (!editMode) {
          setFormFields(initialFormFields)
        }
        setErrors({})
      }
    }
  }, [visible, metadata, editMode, setErrors])

  const coverArt = useCollectionCoverArt(
    formFields.playlist_id,
    formFields ? formFields._cover_art_sizes : null,
    SquareSizes.SIZE_1000_BY_1000
  )

  const onDropArtwork = async (selectedFiles, source) => {
    setErrors({
      ...errors,
      artwork: false
    })
    try {
      let file = selectedFiles[0]
      file = await resizeImage(file)
      const url = URL.createObjectURL(file)
      setFormFields(formFields => ({
        ...formFields,
        artwork: { file, url, source }
      }))
    } catch (err) {
      setFormFields(formFields => ({
        ...formFields,
        artwork: { ...(formFields.artwork || {}), error: err.message }
      }))
    }
  }

  const onChangePlaylistName = name => {
    setFormFields(formFields => ({ ...formFields, playlist_name: name }))
    if (name) {
      setErrors({ ...errors, playlistName: false })
    }
  }

  const onChangeDescription = description => {
    setFormFields(formFields => ({ ...formFields, description }))
  }

  const onSave = () => {
    if (!formFields.playlist_name || (!formFields.artwork.file && !coverArt)) {
      setErrors({
        ...errors,
        artwork: !formFields.artwork.file && !coverArt,
        playlistName: !formFields.playlist_name
      })
    } else {
      props.onSave(formFields)
    }
  }

  const onCancel = () => {
    props.onCancel()
  }

  return (
    <Modal
      title={props.title}
      width={1080}
      visible={props.visible}
      onClose={onCancel}
    >
      <div className={styles.createPlaylist}>
        <UploadArtwork
          artworkUrl={formFields.artwork.url || coverArt}
          onDropArtwork={onDropArtwork}
          error={errors.artwork}
          imageProcessingError={formFields.artwork.error}
        />
        <div className={styles.form}>
          <Input
            variant='elevatedPlaceholder'
            placeholder={`${props.isAlbum ? 'Album' : 'Playlist'} Name`}
            defaultValue={formFields.playlist_name || ''}
            error={errors.playlistName}
            onChange={onChangePlaylistName}
            characterLimit={64}
          />
          <TextArea
            placeholder='Description'
            onChange={onChangeDescription}
            defaultValue={formFields.description || ''}
          />
          <div className={styles.buttons}>
            <div className={styles.buttonsLeft}>
              {props.onDelete ? (
                <Button
                  text={`DELETE ${props.isAlbum ? 'ALBUM' : 'PLAYLIST'}`}
                  size={ButtonSize.TINY}
                  type={ButtonType.SECONDARY}
                  onClick={props.onDelete}
                  className={styles.deleteButton}
                  textClassName={styles.deleteButtonText}
                />
              ) : null}
            </div>
            <div className={styles.buttonRight}>
              <Button
                text='CANCEL'
                size={ButtonSize.TINY}
                type={ButtonType.COMMON}
                onClick={onCancel}
              />
              <Button
                className={styles.saveChangesButton}
                text='SAVE CHANGES'
                size={ButtonSize.TINY}
                type={ButtonType.SECONDARY}
                onClick={debounce(onSave, 500, { leading: true })}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

CreatePlaylistModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  isAlbum: PropTypes.bool.isRequired,
  metadata: PropTypes.object,
  // Whether or not the modal is being used to edit a playlist.
  // Setting this to true prevents defaults from being cleared when the modal closes.
  editMode: PropTypes.bool,
  // When the cancel button is clicked
  onCancel: PropTypes.func,
  // When the save button is clicked
  onSave: PropTypes.func,
  // When the delete button is clicked
  onDelete: PropTypes.func
}

CreatePlaylistModal.defaultProps = {
  visible: true,
  title: 'Create Playlist',
  isAlbum: false,
  editMode: false
}

export default memo(CreatePlaylistModal)
