import { View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import { makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

const useStyles = makeStyles(({ spacing, typography, palette }) => ({
  progressBarContainer: {
    backgroundColor: palette.neutralLight9,
    borderRadius: 22,
    height: spacing(6),
    marginVertical: 14,
    overflow: 'hidden'
  },
  progressBar: {
    backgroundColor: 'black',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'white',
    alignSelf: 'center',
    shadowColor: 'black',
    shadowRadius: 4,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 0 },
    elevation: -1
  },
  shadowTop: {
    top: -10,
    height: 10,
    width: '100%'
  },
  shadowBottom: {
    bottom: -10,
    height: 10,
    width: '100%'
  },
  shadowLeft: {
    left: -10,
    height: '100%',
    width: 10
  },
  shadowRight: {
    right: -10,
    height: '100%',
    width: 10
  }
}))

export const ProgressBar = ({ progress, max }) => {
  const styles = useStyles()
  const { pageHeaderGradientColor1, pageHeaderGradientColor2 } =
    useThemeColors()
  return (
    <View style={styles.progressBarContainer}>
      <LinearGradient
        colors={[pageHeaderGradientColor1, pageHeaderGradientColor2]}
        useAngle={true}
        angle={315}
        style={[
          styles.progressBar,
          {
            width:
              progress > max
                ? '100%'
                : `${Math.round((progress * 100 * 100.0) / max) / 100.0}%`
          }
        ]}
      />
      <View style={[styles.shadow, styles.shadowTop]} />
      <View style={[styles.shadow, styles.shadowBottom]} />
      <View style={[styles.shadow, styles.shadowLeft]} />
      <View style={[styles.shadow, styles.shadowRight]} />
    </View>
  )
}
