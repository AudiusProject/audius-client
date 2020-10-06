import { makeUid } from 'utils/uid'
import { UserCollection } from 'models/Collection'
import { Kind } from 'store/types'
import { reformat as reformatTrack } from 'store/cache/tracks/utils'
import { reformat as reformatUser } from 'store/cache/users/utils'
import { put } from 'redux-saga/effects'
import * as cacheActions from 'store/cache/actions'
import { ID, UID } from 'models/common/Identifiers'
import Track from 'models/Track'
import User from 'models/User'

export function* addTracksFromCollections(
  metadataArray: Array<UserCollection>
) {
  const tracks: Array<{ id: ID; uid: UID; metadata: Track }> = []
  const users: Array<{ id: ID; uid: UID; metadata: User }> = []

  metadataArray.forEach(m => {
    if (m.tracks) {
      m.tracks.forEach(t => {
        tracks.push({
          id: t.track_id,
          uid: makeUid(Kind.TRACKS, t.track_id),
          metadata: reformatTrack(t)
        })
        if (t.user) {
          users.push({
            id: t.user.user_id,
            uid: makeUid(Kind.USERS, t.user.user_id),
            metadata: reformatUser(t.user)
          })
        }
      })
    }
  })

  if (users.length) {
    yield put(
      cacheActions.add(
        Kind.USERS,
        users,
        /* replace */ false,
        /* persist */ true
      )
    )
  }

  if (tracks.length) {
    yield put(
      cacheActions.add(
        Kind.TRACKS,
        tracks,
        /* replace */ false,
        /* persist */ true
      )
    )
  }
}
