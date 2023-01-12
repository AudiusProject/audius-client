import type { User, Track, Nullable } from '@audius/common'
import { cacheUsersSelectors } from '@audius/common'
import { useSelector } from 'react-redux'

import imageEmpty from 'app/assets/images/imageBlank2x.png'
import { useContentNodeImage } from 'app/hooks/useContentNodeImage'

import type { FastImageProps } from './FastImage'
import { FastImage } from './FastImage'

const { getUser } = cacheUsersSelectors

export const DEFAULT_IMAGE_URL =
  'https://download.audius.co/static-resources/preview-image.jpg'

type ImageTrack = Nullable<
  Pick<Track, 'track_id' | 'cover_art_sizes' | 'cover_art' | 'owner_id'>
>

type ImageUser = Nullable<Pick<User, 'creator_node_endpoint'>>

export const useTrackImage = (track: ImageTrack, user?: ImageUser) => {
  const cid = track ? track.cover_art_sizes || track.cover_art : null

  const selectedUser = useSelector((state) =>
    getUser(state, { id: track?.owner_id })
  )

  const contentNodeSource = useContentNodeImage({
    cid,
    user: user ?? selectedUser,
    fallbackImageSource: imageEmpty
  })

  return contentNodeSource
}

type TrackImageProps = {
  track: ImageTrack
  user?: ImageUser
} & FastImageProps

export const TrackImage = (props: TrackImageProps) => {
  const { track, user, ...imageProps } = props

  const { source, handleError } = useTrackImage(track, user)

  return <FastImage {...imageProps} source={source} onError={handleError} />
}
