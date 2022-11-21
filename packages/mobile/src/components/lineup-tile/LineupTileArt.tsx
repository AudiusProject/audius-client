import { useMemo } from 'react'

import type { Remix } from '@audius/common'
import { useLoadImageWithTimeout } from '@audius/common'
import type {
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  ViewStyle
} from 'react-native'
import { View } from 'react-native'

import CoSign, { Size } from 'app/components/co-sign'
import { DynamicImage } from 'app/components/core'

import { useStyles as useTrackTileStyles } from './styles'

type LineupTileArtProps = {
  coSign?: Remix | null
  imageSource?: ImageSourcePropType
  onError?: () => void
  onLoad: () => void
  style?: StyleProp<ViewStyle>
}

export const LineupTileArt = ({
  coSign,
  imageSource,
  onError,
  onLoad,
  style
}: LineupTileArtProps) => {
  const trackTileStyles = useTrackTileStyles()

  const imageStyles = useMemo(
    () => ({
      image: trackTileStyles.image as ImageStyle
    }),
    [trackTileStyles]
  )

  useLoadImageWithTimeout(imageSource, onLoad)

  const imageElement = (
    <DynamicImage source={imageSource} styles={imageStyles} onError={onError} />
  )

  return coSign ? (
    <CoSign size={Size.SMALL} style={[style, trackTileStyles.image]}>
      {imageElement}
    </CoSign>
  ) : (
    <View style={[style, trackTileStyles.image]}>{imageElement}</View>
  )
}
