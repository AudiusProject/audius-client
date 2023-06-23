import { useMemo } from 'react'

import { StyleSheet } from 'react-native'

import IconFavoriteOffLight from 'app/assets/animations/iconFavoriteTrackTileOffLight.json'
import IconFavoriteOnLight from 'app/assets/animations/iconFavoriteTrackTileOnLight.json'
import type { AnimatedButtonProps } from 'app/components/core'
import { AnimatedButton } from 'app/components/core'
import { makeAnimations } from 'app/styles'
import { colorize } from 'app/utils/colorizeLottie'

const styles = StyleSheet.create({
  icon: {
    height: 22,
    width: 22
  },
  iconDisabled: {
    opacity: 0.5
  }
})

const useAnimations = makeAnimations(({ palette }) => {
  const ColorizedOnIcon = colorize(IconFavoriteOnLight, {
    // icon_Favorites Outlines 2.Group 1.Fill 1
    'layers.0.shapes.0.it.1.c.k.0.s': palette.neutralLight4,
    // icon_Favorites Outlines 2.Group 1.Fill 1
    'layers.0.shapes.0.it.1.c.k.1.s': palette.primary
  })

  const ColorizedOffIcon = colorize(IconFavoriteOffLight, {
    // icon_Favorites Outlines 2.Group 1.Fill 1
    'layers.0.shapes.0.it.1.c.k.0.s': palette.primary,
    // icon_Favorites Outlines 2.Group 1.Fill 1
    'layers.0.shapes.0.it.1.c.k.1.s': palette.neutralLight4
  })

  const ColorizedOnIconDark = colorize(IconFavoriteOnLight, {
    // icon_Favorites Outlines 2.Group 1.Fill 1
    'layers.0.shapes.0.it.1.c.k.0.s': palette.neutralLight2,
    // icon_Favorites Outlines 2.Group 1.Fill 1
    'layers.0.shapes.0.it.1.c.k.1.s': palette.primary
  })

  const ColorizedOffIconDark = colorize(IconFavoriteOffLight, {
    // icon_Favorites Outlines 2.Group 1.Fill 1
    'layers.0.shapes.0.it.1.c.k.0.s': palette.primary,
    // icon_Favorites Outlines 2.Group 1.Fill 1
    'layers.0.shapes.0.it.1.c.k.1.s': palette.neutralLight2
  })
  return {
    normal: [ColorizedOnIcon, ColorizedOffIcon],
    dark: [ColorizedOnIconDark, ColorizedOffIconDark]
  }
})

type FavoriteButtonProps = Omit<AnimatedButtonProps, 'iconJSON'> & {
  variant?: 'normal' | 'dark'
}

export const FavoriteButton = (props: FavoriteButtonProps) => {
  const {
    isActive,
    wrapperStyle: wrapperStyleProp,
    variant = 'normal',
    ...other
  } = props
  const { isDisabled } = other
  const wrapperStyle = useMemo(
    () => [styles.icon, isDisabled && styles.iconDisabled, wrapperStyleProp],
    [isDisabled, wrapperStyleProp]
  )

  const animationOptions = useAnimations()
  const animations = animationOptions[variant]

  return (
    <AnimatedButton
      {...other}
      haptics={!isActive}
      iconIndex={isActive ? 1 : 0}
      iconJSON={animations}
      wrapperStyle={wrapperStyle}
    />
  )
}
