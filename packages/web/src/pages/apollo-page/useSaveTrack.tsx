import { gql, useMutation } from '@apollo/client'

const SAVE_TRACK = gql`
  mutation SaveTrack($id: ID!, $optimisticResponse: Track!) {
    saveTrack(
      id: $id
      input: { id: $id, optimisticResponse: $optimisticResponse }
    ) @rest(type: "Track", path: "/track/save", method: "POST", test: 1) {
      id
      __typename
      has_current_user_saved
    }
  }
`

export const useSaveTrack = ({ id }: { id: string }) => {
  const optimisticResponse = {
    saveTrack: {
      id,
      __typename: 'Track',
      has_current_user_saved: true
    }
  }

  return useMutation(SAVE_TRACK, {
    variables: {
      id,
      optimisticResponse: optimisticResponse.saveTrack
    },
    optimisticResponse
    // refetchQueries: [{ query: GET_TRACK }]
  })
}
