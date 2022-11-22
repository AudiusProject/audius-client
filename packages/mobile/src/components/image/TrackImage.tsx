import type { User, Track, Nullable } from '@audius/common'
import { cacheUsersSelectors } from '@audius/common'
import { useSelector } from 'react-redux'

import imageEmpty from 'app/assets/images/imageBlank2x.png'
import { ImageLoader } from 'app/components/core'
import type { ImageLoaderProps } from 'app/components/core'
import { useContentNodeImage } from 'app/hooks/useContentNodeImage'

const { getUser } = cacheUsersSelectors

export const useTrackImage = (
  track: Nullable<Pick<Track, 'cover_art_sizes' | 'cover_art' | 'owner_id'>>,
  user?: Pick<User, 'creator_node_gateways'>
) => {
  const cid = track ? track.cover_art_sizes || track.cover_art : null

  const selectedUser = useSelector((state) =>
    getUser(state, { id: track?.owner_id })
  )
  const useLegacyImagePath = !track?.cover_art_sizes

  return useContentNodeImage({
    cid,
    user: user ?? selectedUser,
    useLegacyImagePath,
    fallbackImageSource: imageEmpty
  })
}

type TrackImageProps = {
  track: Parameters<typeof useTrackImage>[0]
  user: Parameters<typeof useTrackImage>[1]
} & ImageLoaderProps

export const TrackImage = (props: TrackImageProps) => {
  const { track, user, ...imageProps } = props

  const { source, handleError } = useTrackImage(track, user)
  console.log('IMAGE track', source, track)

  return <ImageLoader {...imageProps} source={source} onError={handleError} />
}
