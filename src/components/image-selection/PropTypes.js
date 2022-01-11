import PropTypes from 'prop-types'

export const ImageSelectionProps = {
  error: PropTypes.bool.isRequired,
  // Fired when a close is dispatched, but the animation is not necessarily finished
  onClose: PropTypes.func.isRequired,
  // Fired after the popup finishes closing
  onAfterClose: PropTypes.func,
  // Called with a promised value, which should be awaited.
  // This is useful so that callees can set a processing state as soon as a select
  // has started, even if image selection is async.
  onSelect: PropTypes.func.isRequired,
  // Source of the image selection (ProfilePicture, CoverPhoto, etc.)
  source: PropTypes.oneOf(['ProfilePicture', 'CoverPhoto', 'UploadArtwork'])
}

export const ImageSelectionDefaults = {
  error: false,
  onClose: () => {},
  onAfterClose: () => {},
  onSelect: () => {},
  source: null
}
