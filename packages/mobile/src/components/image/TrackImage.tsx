import type { User, Track, Nullable } from '@audius/common'
import { cacheUsersSelectors } from '@audius/common'
import { useSelector } from 'react-redux'

import imageEmpty from 'app/assets/images/imageBlank2x.png'
import { DynamicImage } from 'app/components/core'
import type { DynamicImageProps } from 'app/components/core'
import { useContentNodeImage } from 'app/hooks/useContentNodeImage'
import { useLocalTrackImage } from 'app/hooks/useLocalTrackImage'

const { getUser } = cacheUsersSelectors

export const useTrackImage = (
  track: Nullable<Pick<Track, 'cover_art_sizes' | 'cover_art' | 'owner_id'>>,
  user?: Pick<User, 'creator_node_endpoint'>
) => {
  const cid = track ? track.cover_art_sizes || track.cover_art : null

  const selectedUser = useSelector((state) =>
    getUser(state, { id: track?.owner_id })
  )

  return useContentNodeImage({
    cid,
    user: user ?? selectedUser,
    fallbackImageSource: imageEmpty
  })
}

type TrackImageProps = {
  track: Track
  user?: Parameters<typeof useTrackImage>[1]
} & DynamicImageProps

export const TrackImage = (props: TrackImageProps) => {
  const { track, user, ...imageProps } = props

  const { source: localSource, handleError: localHandleError } =
    useLocalTrackImage(track?.track_id?.toString())
  const { source, handleError } = useTrackImage(track, user)

  return localSource ? (
    <DynamicImage
      {...imageProps}
      source={localSource}
      onError={localHandleError}
    />
  ) : (
    <DynamicImage {...imageProps} source={source} onError={handleError} />
  )
}
