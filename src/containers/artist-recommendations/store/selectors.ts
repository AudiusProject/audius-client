import { createSelector } from '@reduxjs/toolkit'

import { ID } from 'models/common/Identifiers'
import { getUser, getUsers } from 'store/cache/users/selectors'
import { AppState } from 'store/types'
import { removeNullable } from 'utils/typeUtils'

const getRelatedArtistIds = (state: AppState, props: { id: ID }) =>
  state.application.ui.artistRecommendations[props.id]?.relatedArtistIds

export const makeGetRelatedArtists = () =>
  createSelector([getRelatedArtistIds, getUsers], (relatedArtistIds, users) => {
    console.log('selector', relatedArtistIds)
    if (!relatedArtistIds) return []
    const relatedArtistsPopulated = relatedArtistIds
      .map(id => {
        if (id in users) return users[id]
        return null
      })
      .filter(removeNullable)
    return relatedArtistsPopulated
  })
