import { CommonState } from 'store/commonStore'
import { getUsers } from 'store/users/usersSelectors'
import { removeNullable, createDeepEqualSelector } from 'utils'

import { ID } from '../../../models'

const getRelatedArtistIds = (state: CommonState, props: { id: ID }) =>
  state.ui.artistRecommendations[props.id]?.relatedArtistIds

export const getRelatedArtists = createDeepEqualSelector(
  [getRelatedArtistIds, getUsers],
  (relatedArtistIds, users) => {
    if (!relatedArtistIds) return []
    const relatedArtistsPopulated = relatedArtistIds
      .map((id) => {
        if (id in users) return users[id]
        return null
      })
      .filter(removeNullable)
    return relatedArtistsPopulated
  }
)
