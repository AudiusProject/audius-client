import type { Remix } from '@audius/common'
import type { StyleProp, ViewStyle } from 'react-native'
import { View } from 'react-native'

import CoSign, { Size } from 'app/components/co-sign'

import { useStyles as useTrackTileStyles } from './styles'
import type { LineupTileProps } from './types'

type LineupTileArtProps = {
  coSign?: Remix | null
  renderImage: LineupTileProps['renderImage']
  style?: StyleProp<ViewStyle>
}

export const LineupTileArt = ({
  coSign,
  renderImage,
  style
}: LineupTileArtProps) => {
  const trackTileStyles = useTrackTileStyles()

  const imageElement = renderImage({
    style: trackTileStyles.image
  })

  return coSign ? (
    <CoSign size={Size.SMALL} style={[style, trackTileStyles.image]}>
      {imageElement}
    </CoSign>
  ) : (
    <View style={[style, trackTileStyles.image]}>{imageElement}</View>
  )
}
