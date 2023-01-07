import { Theme } from '@audius/common'
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native'
import { StyleSheet } from 'react-native'

import type { ThemeColors } from 'app/utils/theme'
import {
  matrixTheme,
  defaultTheme,
  darkTheme,
  useThemeVariant
} from 'app/utils/theme'

import { spacing } from './spacing'
import { typography } from './typography'

type StylesOptions = {
  palette: ThemeColors
  typography: typeof typography
  spacing: typeof spacing
  type: Theme
}

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle }

export const makeStyles = <T extends NamedStyles<T> | NamedStyles<any>>(
  styles: (options: StylesOptions) => T | NamedStyles<T>
) => {
  const defaultStylesheet = StyleSheet.create(
    styles({
      type: Theme.DEFAULT,
      palette: defaultTheme,
      spacing,
      typography
    })
  )

  const darkStylesheet = StyleSheet.create(
    styles({
      type: Theme.DARK,
      palette: darkTheme,
      spacing,
      typography
    })
  )

  const matrixStylesheet = StyleSheet.create(
    styles({
      type: Theme.MATRIX,
      palette: matrixTheme,
      spacing,
      typography
    })
  )

  const themedStylesheets = {
    [Theme.DEFAULT]: defaultStylesheet,
    [Theme.DARK]: darkStylesheet,
    [Theme.MATRIX]: matrixStylesheet
  }

  return function useStyles() {
    const themeVariant = useThemeVariant()
    return themedStylesheets[themeVariant]
  }
}
