import React, { useState } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import ReactDropzone from 'react-dropzone'
import { Button, IconCamera, ButtonType } from '@audius/stems'

import InvalidFileType from 'components/upload/InvalidFileType'
import ImageSelectionPopup from './ImageSelectionPopup'

import { ImageSelectionProps, ImageSelectionDefaults } from './PropTypes'
import styles from './ImageSelectionButton.module.css'

const messages = {
  add: 'Add',
  change: 'Change'
}

const ImageSelectionButton = ({
  wrapperClassName,
  buttonClassName,
  isMobile,
  hasImage,
  imageName,
  error,
  includePopup,
  onClick,
  onAfterClose,
  onSelect
}) => {
  const [showModal, setShowModal] = useState(false)

  const closeModal = () => setShowModal(false)
  const openModal = () => setShowModal(true)

  const handleClick = () => {
    if (!showModal) {
      onClick()
      openModal()
    }
  }

  let buttonText = hasImage ? messages.change : messages.add
  if (imageName) buttonText += ` ${imageName}`

  return (
    <div className={cn(styles.wrapper, wrapperClassName)}>
      {includePopup ? (
        <>
          <Button
            className={cn(styles.button, buttonClassName, {
              [styles.hide]: showModal
            })}
            text={buttonText}
            leftIcon={<IconCamera />}
            type={ButtonType.WHITE}
            onClick={handleClick}
          />
          <ImageSelectionPopup
            className={styles.popup}
            error={error}
            isVisible={showModal}
            onSelect={onSelect}
            onClose={closeModal}
            onAfterClose={onAfterClose}
          />
        </>
      ) : (
        <>
          <ReactDropzone
            onDrop={onSelect}
            className={styles.dropzone}
            accept='image/*'
          >
            <Button
              className={cn(styles.button, styles.noPopup, {
                [styles.hide]: hasImage
              })}
              text={buttonText}
              leftIcon={<IconCamera />}
              type={ButtonType.WHITE}
              onClick={handleClick}
            />
          </ReactDropzone>
          {error ? (
            <InvalidFileType className={styles.invalidFileType} />
          ) : null}
        </>
      )}
    </div>
  )
}

ImageSelectionButton.propTypes = {
  wrapperClassName: PropTypes.string,
  buttonClassName: PropTypes.string,
  hasImage: PropTypes.bool.isRequired,
  // The name of the image (e.g. render the button as Add "Artwork" or Add "Cover Photo")
  imageName: PropTypes.string,
  // Whether or not to show the image selection modal. Otherwise, the
  // button itself is the dropzone.
  includePopup: PropTypes.bool,
  onClick: PropTypes.func,
  ...ImageSelectionProps
}

ImageSelectionButton.defaultProps = {
  hasImage: false,
  isMobile: false,
  includePopup: true,
  onClick: () => {},
  ...ImageSelectionDefaults
}

export default ImageSelectionButton
