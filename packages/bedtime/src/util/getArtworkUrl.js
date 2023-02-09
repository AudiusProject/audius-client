export const getArtworkUrl = (
  collectionOrTrack,
  useDefaultArtworkIfMissing
) => {
  const artworkUrl = (collectionOrTrack?.artwork || {})['480x480']
  if (!artworkUrl) {
    if (useDefaultArtworkIfMissing) {
      return 'https://download.audius.co/static-resources/preview-image.jpg'
    }
    return null
  }
  return artworkUrl
}
