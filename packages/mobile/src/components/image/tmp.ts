export {}
// import type { User, Track, Nullable } from '@audius/common'
// import { cacheUsersSelectors } from '@audius/common'
// import type { FastImageProps, Source } from 'react-native-fast-image'
// import FastImage from 'react-native-fast-image'
// import { useSelector } from 'react-redux'

// import imageEmpty from 'app/assets/images/imageBlank2x.png'
// import { useContentNodeImage } from 'app/hooks/useContentNodeImage'
// // import { useLocalTrackImage } from 'app/hooks/useLocalImage'

// const { getUser } = cacheUsersSelectors

// export const DEFAULT_IMAGE_URL =
//   'https://download.audius.co/static-resources/preview-image.jpg'

// const useTrackImage = (
//   track: Nullable<
//     Pick<Track, 'track_id' | 'cover_art_sizes' | 'cover_art' | 'owner_id'>
//   >,
//   user?: Pick<User, 'creator_node_endpoint'>
// ) => {
//   const cid = track ? track.cover_art_sizes || track.cover_art : null

//   const selectedUser = useSelector((state) =>
//     getUser(state, { id: track?.owner_id })
//   )

//   const contentNodeSource = useContentNodeImage({
//     cid,
//     user: user ?? selectedUser,
//     fallbackImageSource: imageEmpty
//   })

//   return contentNodeSource
// }

// export type FastTrackImageProps = {
//   track: Track
//   user?: User
// } & Partial<Omit<FastImageProps, 'source'>> & {
//     source?: Source
//   }

// export const FastTrackImage = (props: FastTrackImageProps) => {
//   const { track, user, source: sourceProp, ...other } = props

//   const { source, handleError } = useTrackImage(track, user)

//   return (
//     <FastImage
//       source={{
//         uri: source?.[0]?.uri,
//         ...sourceProp
//       }}
//       onError={handleError}
//       {...other}
//     />
//   )
// }
