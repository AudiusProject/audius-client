import { getCollection } from 'store/cache/collections/selectors'
import { CommonState } from 'store/commonStore'
import { getTracks as getCachedTracks } from 'store/tracks/tracksSelectors'
import { getUsers } from 'store/users/usersSelectors'
import { removeNullable } from 'utils/typeUtils'

export const getBaseState = (state: CommonState) => state.ui.createPlaylistModal

export const getIsOpen = (state: CommonState) => getBaseState(state).isOpen
export const getId = (state: CommonState) => getBaseState(state).collectionId
export const getHideFolderTab = (state: CommonState) =>
  getBaseState(state).hideFolderTab

export const getMetadata = (state: CommonState) => {
  const id = getId(state)
  if (!id) return null
  return getCollection(state, { id })
}

export const getTracks = (state: CommonState) => {
  const metadata = getMetadata(state)
  if (!metadata) return null

  const trackIds = metadata.playlist_contents.track_ids.map((t) => t.track)
  const tracks = getCachedTracks(state, { ids: trackIds })
  const userIds = Object.keys(tracks)
    .map((trackId) => tracks[trackId as unknown as number]?.owner_id)
    .filter(removeNullable)
  const users = getUsers(state, { ids: userIds })

  return trackIds
    .map((id) => {
      const track = tracks[id]
      if (!track) return null
      return {
        ...track,
        user: users[track.owner_id]
      }
    })
    .filter(removeNullable)
}
