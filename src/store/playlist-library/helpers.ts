import { SmartCollectionVariant } from 'containers/smart-collection/types'
import { ID } from 'models/common/Identifiers'
import {
  PlaylistLibrary,
  PlaylistLibraryFolder,
  PlaylistLibraryIdentifier
} from 'models/PlaylistLibrary'

/**
 * Finds an item by id in the playlist library
 * @param library
 * @param playlistId
 * @returns the identifier or false
 */
export const findInPlaylistLibrary = (
  library: PlaylistLibrary | PlaylistLibraryFolder,
  playlistId: ID | SmartCollectionVariant
): PlaylistLibraryIdentifier | false => {
  if (!library.contents) return false

  // Simple DFS (this likely is very small, so this is fine)
  for (const item of library.contents) {
    switch (item.type) {
      case 'folder': {
        const contains = findInPlaylistLibrary(item, playlistId)
        if (contains) return contains
        break
      }
      case 'playlist':
      case 'explore_playlist':
        if (item.playlist_id === playlistId) return item
        break
    }
  }
  return false
}

/**
 * Finds the index of a playlist id in the library, returning false if not found
 * @param library
 * @param playlistId
 * @returns {number | false}
 */
export const findIndexInPlaylistLibrary = (
  library: PlaylistLibrary | PlaylistLibraryFolder,
  playlistId: ID | SmartCollectionVariant
): number | false => {
  if (!library.contents) return false

  // Simple DFS (this likely is very small, so this is fine)
  for (const [i, item] of library.contents.entries()) {
    switch (item.type) {
      case 'folder': {
        // TODO support folders. Need to devise a better system reorders
        break
      }
      case 'playlist':
      case 'explore_playlist':
        if (item.playlist_id === playlistId) return i
        break
    }
  }
  return false
}

/**
 * Removes a playlist from the library and returns the removed item as well as the
 * updated library (does not mutate)
 * @param library
 * @param playlistId the id of the playlist to remove
 * @returns { library, removed }
 */
export const removeFromPlaylistLibrary = (
  library: PlaylistLibrary | PlaylistLibraryFolder,
  playlistId: ID | SmartCollectionVariant
): {
  library: PlaylistLibrary | PlaylistLibraryFolder
  removed: PlaylistLibraryIdentifier | null
} => {
  if (!library.contents) return { library, removed: null }

  const newContents: (PlaylistLibraryFolder | PlaylistLibraryIdentifier)[] = []
  let removed: PlaylistLibraryIdentifier | null = null
  for (const item of library.contents) {
    let newItem: PlaylistLibraryFolder | PlaylistLibraryIdentifier | null = item
    switch (item.type) {
      case 'folder': {
        const res = removeFromPlaylistLibrary(item, playlistId)
        removed = res.removed
        newItem = {
          type: item.type,
          name: item.name,
          contents: res.library.contents
        }
        break
      }
      case 'playlist':
      case 'explore_playlist':
        if (item.playlist_id === playlistId) {
          removed = item
          newItem = null
        }
    }
    if (newItem) {
      newContents.push(newItem)
    }
  }
  return {
    library: {
      ...library,
      contents: newContents
    },
    removed
  }
}

/**
 * Reorders a playlist library
 * TODO: Support folder reordering
 * @param library
 * @param draggingId the playlist being reordered
 * @param droppingId the playlist where the dragged one was dropped onto
 */
export const reorderPlaylistLibrary = (
  library: PlaylistLibrary | PlaylistLibraryFolder,
  draggingId: ID | SmartCollectionVariant,
  droppingId: ID | SmartCollectionVariant
) => {
  // Find the dragging id and remove it from the library if present.
  let entry: PlaylistLibraryIdentifier | null
  const { library: newLibrary, removed } = removeFromPlaylistLibrary(
    library,
    draggingId
  )
  entry = removed
  if (!entry) {
    if (typeof draggingId === 'number') {
      entry = {
        type: 'playlist',
        playlist_id: draggingId
      }
    } else {
      entry = {
        type: 'explore_playlist',
        playlist_id: draggingId
      }
    }
  }

  const newContents = [...newLibrary.contents]

  let index: number
  // We are dropping to the top
  if (droppingId === -1) {
    index = 0
  } else {
    // Find the droppable id and place the draggable id after it
    const found = findIndexInPlaylistLibrary(newLibrary, droppingId)
    if (found === false) return library
    index = found + 1
  }
  // Doesn't support folder reorder
  newContents.splice(index, 0, entry)
  return {
    ...library,
    contents: newContents
  }
}
