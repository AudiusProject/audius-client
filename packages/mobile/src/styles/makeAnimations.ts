import { Theme } from '@audius/common'

import type { ThemeColors } from 'app/utils/theme'
import {
  useThemeVariant,
  darkTheme,
  matrixTheme,
  defaultTheme
} from 'app/utils/theme'

type AnimationJson = any

type AnimationCreatorConfig = { palette: ThemeColors; type: Theme }

export const makeAnimations = (
  animationCreator: (config: AnimationCreatorConfig) => AnimationJson[]
) => {
  const themedAnimations = {
    [Theme.DEFAULT]: animationCreator({
      palette: defaultTheme,
      type: Theme.DEFAULT
    }),
    [Theme.DARK]: animationCreator({
      palette: darkTheme,
      type: Theme.DARK
    }),
    [Theme.MATRIX]: animationCreator({
      palette: matrixTheme,
      type: Theme.MATRIX
    })
  }

  return function useAnimations() {
    const themeVariant = useThemeVariant()
    return themedAnimations[themeVariant]
  }
}
