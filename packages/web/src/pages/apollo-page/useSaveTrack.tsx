import { gql, useMutation } from '@apollo/client'
import { decodeHashId, cacheActions, Kind } from '@audius/common'
import { useDispatch } from 'react-redux'

import { audiusBackendInstance } from 'services/audius-backend/audius-backend-instance'

import { confirmMutation } from './confirmMutation'

const SAVE_TRACK = gql`
  mutation SaveTrack($id: ID!, $optimisticResponse: Track!) {
    saveTrack(
      id: $id
      input: { id: $id, optimisticResponse: $optimisticResponse }
    ) @rest(type: "Track", path: "/track/save", method: "POST") {
      id
      __typename
      has_current_user_saved
    }
  }
`

export const useSaveTrack = ({ id }: { id: string }) => {
  const dispatch = useDispatch()
  const optimisticResponse = {
    id,
    __typename: 'Track',
    has_current_user_saved: true
  }

  return useMutation(SAVE_TRACK, {
    variables: {
      id,
      optimisticResponse
    },
    optimisticResponse: {
      saveTrack: optimisticResponse
    },
    update(cache, { data: { saveTrack } }) {
      dispatch(
        cacheActions.update(Kind.TRACKS, [
          {
            id: decodeHashId(saveTrack.id),
            metadata: {
              has_current_user_saved: saveTrack.has_current_user_saved
            }
          }
        ])
      )
    }
  })
}

export const confirmSaveTrack = confirmMutation(async (options) => {
  const id = decodeHashId(options.body.id)
  if (id) {
    return audiusBackendInstance.saveTrack(id)
  }
})
