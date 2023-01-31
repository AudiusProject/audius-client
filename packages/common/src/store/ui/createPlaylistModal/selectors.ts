import { UserTrack } from 'models/Track'
import { getCollection } from 'store/cache/collections/selectors'
import { getTracks as getCachedTracks } from 'store/cache/tracks/selectors'
import { getUsers } from 'store/cache/users/selectors'
import { CommonState } from 'store/commonStore'
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
    .map((trackId) => {
      const parsedTrackId = parseInt(trackId)
      const track = tracks[parsedTrackId]
      if (!track) return null
      return track.owner_id
    })
    .filter(removeNullable)
  const users = getUsers(state, { ids: userIds })

  return trackIds
    .map((id) => {
      if (!tracks[id] && !users?.[tracks[id]!.owner_id]) return null
      return {
        ...tracks[id],
        user: users?.[tracks[id]!.owner_id]
      } as UserTrack
    })
    .filter(removeNullable)
}
