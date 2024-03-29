import { View } from 'react-native'

import IconCrown from 'app/assets/images/iconCrown.svg'
import IconTrending from 'app/assets/images/iconTrending.svg'
import Text from 'app/components/text'
import { makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

import { useStyles as useTrackTileStyles } from './styles'

const useStyles = makeStyles(({ palette, spacing }) => ({
  text: {
    color: palette.secondary
  },
  icon: {
    marginRight: spacing(1)
  }
}))

type LineupTileRankIconProps = {
  /** Whether or not to show the crown icon */
  showCrown?: boolean
  /** Index of this item in the lineup */
  index: number
}

export const LineupTileRankIcon = (props: LineupTileRankIconProps) => {
  const { showCrown, index } = props
  const styles = useStyles()
  const trackTileStyles = useTrackTileStyles()
  const { secondary } = useThemeColors()
  const Icon = showCrown ? IconCrown : IconTrending
  return (
    <View style={trackTileStyles.statItem}>
      <Icon fill={secondary} style={styles.icon} height={14} width={14} />
      <Text style={[trackTileStyles.statText, styles.text]}>{index + 1}</Text>
    </View>
  )
}
