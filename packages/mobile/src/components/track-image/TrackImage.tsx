import type { DynamicImageProps } from 'app/components/core'
import { DynamicImage } from 'app/components/core'
import { useTrackCoverArt } from 'app/hooks/useTrackCoverArt'

type TrackImageProps = {
  track: Parameters<typeof useTrackCoverArt>[0]
} & DynamicImageProps

export const TrackImage = (props: TrackImageProps) => {
  const { track, ...imageProps } = props

  const { source, handleError } = useTrackCoverArt(track)

  return <DynamicImage {...imageProps} source={source} onError={handleError} />
}
