import { useMemo } from 'react'

import type { Remix } from '@audius/common'
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
import type { LineupTileProps } from './types'

type LineupTileArtProps = {
  coSign?: Remix | null
  onLoad: () => void
  renderImage: LineupTileProps['renderImage']
  style?: StyleProp<ViewStyle>
}

export const LineupTileArt = ({
  coSign,
  onLoad,
  renderImage,
  style
}: LineupTileArtProps) => {
  const trackTileStyles = useTrackTileStyles()

  const imageStyles = useMemo(
    () => ({
      image: trackTileStyles.image as ImageStyle
    }),
    [trackTileStyles]
  )

  const imageElement = renderImage({ styles: imageStyles, onLoad })

  return coSign ? (
    <CoSign size={Size.SMALL} style={[style, trackTileStyles.image]}>
      {imageElement}
    </CoSign>
  ) : (
    <View style={[style, trackTileStyles.image]}>{imageElement}</View>
  )
}
