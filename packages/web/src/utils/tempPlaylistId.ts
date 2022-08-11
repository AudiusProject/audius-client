import { FeatureFlags } from '@audius/common'

import { getFeatureEnabled } from 'services/remote-config/featureFlagHelpers'

export const getTempPlaylistId = () => {
  console.log('asdf getTempPlaylistId')

  const playlistEntityManagerIsEnabled = getFeatureEnabled(
    FeatureFlags.PLAYLIST_ENTITY_MANAGER_ENABLED
  )
  console.log(
    'asdf playlistEntityManagerIsEnabled',
    playlistEntityManagerIsEnabled
  )
  if (playlistEntityManagerIsEnabled) {
    // Minimum playlist ID, intentionally higher than legacy playlist ID range
    const MIN_PLAYLIST_ID = 400000
    // Maximum playlist ID, reflects postgres max integer value
    const MAX_PLAYLIST_ID = 2147483647

    const randomPlaylistId = Math.floor(
      Math.random() * (MAX_PLAYLIST_ID - MIN_PLAYLIST_ID) + MIN_PLAYLIST_ID
    )
    return randomPlaylistId
  }

  return Date.now()
}
