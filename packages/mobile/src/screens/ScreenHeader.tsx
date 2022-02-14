import { View } from 'react-native'

import GradientText from 'app/components/gradient-text'
import { makeStyles } from 'app/styles'

type ScreenHeaderProps = {
  text: string
}

const useStyles = makeStyles(({ palette }) => ({
  root: {
    backgroundColor: palette.white,
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: palette.neutralLight8
  },
  heading: {
    fontSize: 24,
    marginLeft: 12,
    lineHeight: 52,
    textShadowOffset: { height: 2, width: 0 },
    textShadowRadius: 4,
    textShadowColor: 'rgba(162,47,235,0.2)'
  }
}))

export const ScreenHeader = ({ text }: ScreenHeaderProps) => {
  const styles = useStyles()

  return (
    <View style={styles.root}>
      <GradientText accessibilityRole='header' style={styles.heading}>
        {text}
      </GradientText>
    </View>
  )
}
