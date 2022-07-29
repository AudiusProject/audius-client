import { useCallback, useState } from 'react'

import type { ImageProps } from 'react-native'
import { View, Animated } from 'react-native'

import { useColor } from 'app/utils/theme'

/**
 * Fades in images
 */
type ImageLoadProps = ImageProps & { style?: Record<string, any> }
const ImageLoader = (props: ImageLoadProps) => {
  const { style = {}, ...restProps } = props
  const [opacity] = useState(new Animated.Value(0))
  const backgroundColor = useColor('neutralLight5')

  const onLoad = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start()
  }, [opacity])
  return (
    <View
      style={[
        style,
        {
          backgroundColor
        }
      ]}
    >
      <Animated.Image
        onLoad={onLoad}
        {...restProps}
        style={[
          {
            opacity
          },
          style
        ]}
      />
    </View>
  )
}

export default ImageLoader
