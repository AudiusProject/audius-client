import { gql, useQuery } from '@apollo/client'

const GET_TRACK = gql`
  query Track($handle: String!, $slug: String!, $userId: String!) {
    track(handle: $handle, slug: $slug, userId: $userId)
      @rest(
        type: "Track"
        path: "/tracks?handle={args.handle}&slug={args.slug}&user_id={args.userId}"
      ) {
      id
      title
      name
      has_current_user_saved
      user @type(name: "User") {
        name
      }
    }
  }
`
export const useGetTrack = () =>
  useQuery(GET_TRACK, {
    variables: {
      handle: 'joncaseybeats',
      slug: 'nghtmre-trials-jon-casey-remix',
      userId: 'D8v5P'
    }
  })
