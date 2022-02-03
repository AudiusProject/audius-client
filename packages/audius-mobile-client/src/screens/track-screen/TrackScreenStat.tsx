import { Pressable, StyleSheet } from 'react-native'

import Text from 'app/components/text'
import { usePressScaleAnimation } from 'app/hooks/usePressScaleAnimation'
import { useThemedStyles } from 'app/hooks/useThemedStyles'
import { flexRowCentered } from 'app/styles'
import { formatCount } from 'app/utils/format'
import { useThemeColors, ThemeColors } from 'app/utils/theme'

type TrackScreenStatProps = {
  count: number
  onPress?: () => void
  renderLabel: (color: string) => JSX.Element
  size?: number
}

const createStyles = (themeColors: ThemeColors) =>
  StyleSheet.create({
    countContainer: {
      ...flexRowCentered(),
      justifyContent: 'center',
      marginHorizontal: 24,
      paddingVertical: 4,
      paddingHorizontal: 8
    },

    count: {
      fontSize: 16,
      color: themeColors.neutral,
      textAlign: 'center',
      marginRight: 3
    }
  })

export const TrackScreenStat = ({
  count,
  onPress,
  renderLabel
}: TrackScreenStatProps) => {
  const styles = useThemedStyles(createStyles)
  const scale = usePressScaleAnimation()
  const { neutralLight4 } = useThemeColors()

  return (
    <Pressable
      style={styles.countContainer}
      onPressIn={scale.handlePressIn}
      onPressOut={scale.handlePressOut}
      onPress={onPress}
    >
      <Text style={styles.count} weight='bold'>
        {formatCount(count)}
      </Text>
      {renderLabel(neutralLight4)}
    </Pressable>
  )
}
