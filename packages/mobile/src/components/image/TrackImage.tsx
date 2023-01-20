import type { User, Track, Nullable } from '@audius/common'
import { cacheUsersSelectors } from '@audius/common'
import type { ImageStyle } from 'react-native-fast-image'
import { useSelector } from 'react-redux'

import imageEmpty from 'app/assets/images/imageBlank2x.png'
import { useContentNodeImage } from 'app/hooks/useContentNodeImage'
import { useLocalTrackImage } from 'app/hooks/useLocalImage'
import type { StylesProp } from 'app/styles'

import type { FastImageProps } from './FastImage'
import { FastImage } from './FastImage'

const { getUser } = cacheUsersSelectors

type ImageTrack = Nullable<
  Pick<Track, 'track_id' | 'cover_art_sizes' | 'cover_art' | 'owner_id'>
>

type ImageUser = Nullable<Pick<User, 'creator_node_endpoint'>>

export const DEFAULT_IMAGE_URL =
  'https://download.audius.co/static-resources/preview-image.jpg'

export const useTrackImage = (track: ImageTrack, user?: ImageUser) => {
  const cid = track ? track.cover_art_sizes || track.cover_art : null

  const selectedUser = useSelector((state) =>
    getUser(state, { id: track?.owner_id })
  )
  const { value: localSource, loading } = useLocalTrackImage(
    track?.track_id.toString()
  )

  const contentNodeSource = useContentNodeImage({
    cid,
    user: user ?? selectedUser,
    fallbackImageSource: imageEmpty,
    localSource
  })

  return loading ? null : contentNodeSource
}

type TrackImageProps = {
  track: ImageTrack
  user?: ImageUser
  styles?: StylesProp<{
    image: ImageStyle
  }>
} & FastImageProps

export const TrackImage = (props: TrackImageProps) => {
  const { track, user, styles, style, ...imageProps } = props
  const trackImageSource = useTrackImage(track, user)

  if (!trackImageSource) return null

  const { source, handleError } = trackImageSource

  return (
    <FastImage
      {...imageProps}
      style={[style, styles?.image]}
      source={source}
      onError={handleError}
    />
  )
}
