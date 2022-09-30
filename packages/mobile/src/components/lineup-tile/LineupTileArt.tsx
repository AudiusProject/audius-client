import type { Remix } from '@audius/common'
import { useLoadImageWithTimeout } from '@audius/common'
import type { ImageStyle, StyleProp, ViewStyle } from 'react-native'
import { View } from 'react-native'

import CoSign, { Size } from 'app/components/co-sign'
import { DynamicImage } from 'app/components/core'

import { useStyles as useTrackTileStyles } from './styles'

type LineupTileArtProps = {
  coSign?: Remix | null
  imageUrl?: string
  onLoad: () => void
  style?: StyleProp<ViewStyle>
}

export const LineupTileArt = ({
  coSign,
  imageUrl,
  onLoad,
  style
}: LineupTileArtProps) => {
  const trackTileStyles = useTrackTileStyles()

  useLoadImageWithTimeout(imageUrl, onLoad)

  const imageElement = (
    <DynamicImage
      uri={imageUrl}
      styles={{ image: trackTileStyles.image as ImageStyle }}
    />
  )

  return coSign ? (
    <CoSign size={Size.SMALL} style={[style, trackTileStyles.image]}>
      {imageElement}
    </CoSign>
  ) : (
    <View style={[style, trackTileStyles.image]}>{imageElement}</View>
  )
}
