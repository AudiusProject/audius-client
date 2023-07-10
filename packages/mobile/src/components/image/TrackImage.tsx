import type { Track, Nullable, SquareSizes, ID, Maybe } from '@audius/common'
import { reachabilitySelectors } from '@audius/common'
import { useSelector } from 'react-redux'

import imageEmpty from 'app/assets/images/imageBlank2x.png'
import { useContentNodeImage } from 'app/hooks/useContentNodeImage'
import { getLocalTrackCoverArtPath } from 'app/services/offline-downloader'
import { getTrackDownloadStatus } from 'app/store/offline-downloads/selectors'
import { OfflineDownloadStatus } from 'app/store/offline-downloads/slice'
import { useThemeColors } from 'app/utils/theme'

import type { FastImageProps } from './FastImage'
import { FastImage } from './FastImage'

export const DEFAULT_IMAGE_URL =
  'https://download.audius.co/static-resources/preview-image.jpg'

const { getIsReachable } = reachabilitySelectors

type UseTrackImageOptions = {
  track: Nullable<Pick<Track, 'track_id' | 'cover_art_sizes' | 'cover_art'>>
  size: SquareSizes
}

const useLocalTrackImageUri = (trackId: Maybe<ID>) => {
  const trackImageUri = useSelector((state) => {
    if (!trackId) return null

    const isReachable = getIsReachable(state)
    if (isReachable) return null

    const trackDownloadStatus = getTrackDownloadStatus(state, trackId)
    const isDownloaded = trackDownloadStatus === OfflineDownloadStatus.SUCCESS
    if (!isDownloaded) return null

    return `file://${getLocalTrackCoverArtPath(trackId.toString())}`
  })

  return trackImageUri
}

export const useTrackImage = ({ track, size }: UseTrackImageOptions) => {
  const cid = track ? track.cover_art_sizes || track.cover_art : null

  const localTrackImageUri = useLocalTrackImageUri(track?.track_id)

  const contentNodeSource = useContentNodeImage({
    cid,
    size,
    fallbackImageSource: imageEmpty,
    localSource: localTrackImageUri ? { uri: localTrackImageUri } : null
  })

  return contentNodeSource
}

type TrackImageProps = UseTrackImageOptions & Partial<FastImageProps>

export const TrackImage = (props: TrackImageProps) => {
  const { track, size, style, ...other } = props

  const trackImageSource = useTrackImage({ track, size })
  const { neutralLight8 } = useThemeColors()

  if (!trackImageSource) return null

  const { source, handleError, isFallbackImage } = trackImageSource

  if (isFallbackImage) {
    return (
      <FastImage
        {...other}
        style={[style, { backgroundColor: neutralLight8 }]}
        source={source}
        onError={handleError}
      />
    )
  }

  return (
    <FastImage {...other} style={style} source={source} onError={handleError} />
  )
}
