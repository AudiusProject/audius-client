export const getTempPlaylistId = () => {
  // Minimum playlist ID, intentionally higher than legacy playlist ID range
  const MIN_PLAYLIST_ID = 400000
  // Maximum playlist ID, reflects postgres max integer value
  const MAX_PLAYLIST_ID = 2147483647

  const randomPlaylistId = Math.floor(
    Math.random() * (MAX_PLAYLIST_ID - MIN_PLAYLIST_ID) + MIN_PLAYLIST_ID
  )
  return randomPlaylistId
}
