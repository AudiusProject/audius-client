import type { Track, Nullable } from '@audius/common'
import { cacheUsersSelectors } from '@audius/common'
import { useSelector } from 'react-redux'

import imageEmpty from 'app/assets/images/imageBlank2x.png'
import { DynamicImage } from 'app/components/core'
import type { DynamicImageProps } from 'app/components/core'
import { useContentNodeImage } from 'app/hooks/useContentNodeImage'

const { getUser } = cacheUsersSelectors

export const useTrackImage = (
  track: Nullable<Pick<Track, 'cover_art_sizes' | 'cover_art' | 'owner_id'>>
) => {
  const cid = track ? track.cover_art_sizes || track.cover_art : null

  const user = useSelector((state) => getUser(state, { id: track?.owner_id }))
  const useLegacyImagePath = !track?.cover_art_sizes

  return useContentNodeImage({
    cid,
    user,
    useLegacyImagePath,
    fallbackImageSource: imageEmpty
  })
}

type TrackImageProps = {
  track: Parameters<typeof useTrackImage>[0]
} & DynamicImageProps

export const TrackImage = (props: TrackImageProps) => {
  const { track, ...imageProps } = props

  const { source, handleError } = useTrackImage(track)

  return <DynamicImage {...imageProps} source={source} onError={handleError} />
}
