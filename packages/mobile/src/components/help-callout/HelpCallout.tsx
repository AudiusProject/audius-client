import type { ComponentType, ReactNode } from 'react'

import type { ViewStyle } from 'react-native'
import { View } from 'react-native'

import IconQuestionCircle from 'app/assets/images/iconQuestionCircle.svg'
import { Text } from 'app/components/core'
import { makeStyles } from 'app/styles'
import type { SvgProps } from 'app/types/svg'
import { useColor } from 'app/utils/theme'

const useStyles = makeStyles(({ spacing, palette }) => ({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(4),
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(4),
    borderWidth: 1,
    borderColor: palette.neutralLight7,
    borderRadius: spacing(2),
    backgroundColor: palette.neutralLight9
  },
  text: {
    flex: 1,
    flexWrap: 'wrap'
  }
}))

type HelpCalloutProps = {
  content: ReactNode
  style?: ViewStyle
  icon?: ComponentType<SvgProps>
}

/**
 * @todo Rename to Hint
 */
export const HelpCallout = (props: HelpCalloutProps) => {
  const { style, content, icon: Icon = IconQuestionCircle } = props
  const styles = useStyles()
  const neutral = useColor('neutral')

  return (
    <View style={[styles.root, style]}>
      <Icon fill={neutral} />
      <Text style={styles.text}>{content}</Text>
    </View>
  )
}
