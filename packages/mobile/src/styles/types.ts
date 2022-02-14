import { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native'

export type StylesProp<T> = { [K in keyof T]?: StyleProp<T[K]> }

type Style = StyleProp<ViewStyle | ImageStyle | TextStyle>

/**
 * Utility type to declare `style` and `styles` props on a component
 *
 * `style` should always be applied to the root of the component and is equivalent
 * to `styles.root`
 */
export type WithStyles<
  T extends Record<string, any>,
  Styles extends { root: Style } & Record<string, Style>
> = T & {
  style?: Styles['root']
  styles?: Styles
}
