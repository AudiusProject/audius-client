import type { ImageSourcePropType } from 'react-native'
import type {
  FastImageProps as RNFastImageProps,
  Priority
} from 'react-native-fast-image'
import RNFastImage from 'react-native-fast-image'

export type FastImageProps = Partial<Omit<RNFastImageProps, 'source'>> & {
  source?: ImageSourcePropType
  priority?: Priority
  size?: 'small' | 'medium' | 'large'
}

const sizeMap = {
  small: 0,
  medium: 1,
  large: 2
}

export const FastImage = (props: FastImageProps) => {
  const { source, priority, size = 'small', ...other } = props

  const imageSource =
    typeof source === 'number'
      ? source
      : { uri: source?.[sizeMap[size]]?.uri, priority }

  return <RNFastImage source={imageSource} {...other} />
}
