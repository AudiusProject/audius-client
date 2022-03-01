import { Collection } from 'audius-client/src/common/models/Collection'
import { makeGetLineupMetadatas } from 'audius-client/src/common/store/lineup/selectors'
import {
  getProfileFeedLineup,
  getProfileTracksLineup,
  makeGetProfile
} from 'audius-client/src/common/store/pages/profile/selectors'
import { Nullable } from 'audius-client/src/common/utils/typeUtils'
import { isEmpty } from 'lodash'

import { useSelectorWeb } from 'app/hooks/useSelectorWeb'

export const getProfile = makeGetProfile()

export const useProfileTracksLineup = () => {
  return useSelectorWeb(getProfileTracksLineup, (a, b) => {
    return a.entries.length === b.entries.length
  })
}

const hasCoverArt = (collection: Collection) =>
  !isEmpty(collection._cover_art_sizes)

const areCollectionsEqual = (
  a?: Nullable<Collection[]>,
  b?: Nullable<Collection[]>
) => {
  return Boolean(
    a &&
      b &&
      a.length === b.length &&
      a.filter(hasCoverArt).length === b.filter(hasCoverArt).length
  )
}

export const useProfileAlbums = () =>
  useSelectorWeb(getProfile, (a, b) => {
    return (
      a.profile?.user_id === b.profile?.user_id &&
      areCollectionsEqual(a?.albums, b?.albums)
    )
  })

export const useProfilePlaylists = () =>
  useSelectorWeb(getProfile, (a, b) => {
    return (
      a.profile?.user_id === b.profile?.user_id &&
      areCollectionsEqual(a?.playlists, b?.playlists)
    )
  })

const getUserFeedMetadatas = makeGetLineupMetadatas(getProfileFeedLineup)

export const useProfileFeedLineup = () => {
  return useSelectorWeb(getUserFeedMetadatas, (a, b) => {
    return a.entries.length === b.entries.length
  })
}
