import { ReactChild } from 'react'

import { StyleSheet, View } from 'react-native'

import GradientText from 'app/components/gradient-text'
import { useThemedStyles } from 'app/hooks/useThemedStyles'
import { ThemeColors } from 'app/utils/theme'

type Props = {
  children?: ReactChild
  text: string
}

const createStyles = (themeColors: ThemeColors) =>
  StyleSheet.create({
    root: {
      backgroundColor: themeColors.white,
      height: 52,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.neutralLight8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 12
    },
    header: {
      fontSize: 24,
      lineHeight: 52,
      textShadowOffset: { height: 2, width: 0 },
      textShadowRadius: 4,
      textShadowColor: 'rgba(162,47,235,0.2)'
    }
  })

// TODO: Potentially consolidate with `components/header`
export const ScreenHeader = ({ children, text }: Props) => {
  const styles = useThemedStyles(createStyles)

  return (
    <View style={styles.root}>
      <GradientText style={styles.header} text={text} />
      {children}
    </View>
  )
}
