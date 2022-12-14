export const startSyncWorker = () => {}

/**
 * Favorites
 *  Check for new and removed track favorites
 *  Check for new and removed collections
 */

const syncCollection = () => {
  // Fetch latest metadata
  // Save metadata to cache and disk
  // If cover_art_sizes changed, get latest cover art
  // Foreach track:
  //    Download track if not already present
  // Foreach removed track:
  //    Remove download
}

const syncTrack = () => {
  // Fetch latest metadata
  // Save metadata to cache and disk
  // If cover_art_sizes changed, get latest cover art
  // Redownload audio?
}
