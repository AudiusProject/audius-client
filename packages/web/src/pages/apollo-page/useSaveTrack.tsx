import { useMutation } from '@apollo/client'
import { decodeHashId, cacheActions, Kind } from '@audius/common'
import { mutations } from '@audius/sdk'
import { useDispatch } from 'react-redux'

export const useSaveTrack = ({ id }: { id: string }) => {
  const dispatch = useDispatch()
  const optimisticResponse = {
    id,
    __typename: 'Track',
    has_current_user_saved: true
  }

  return useMutation(mutations.SAVE_TRACK, {
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
