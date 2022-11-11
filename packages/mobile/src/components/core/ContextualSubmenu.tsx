import { useCallback } from 'react'

import type { ViewStyle } from 'react-native'
import { View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'

import IconCaretRight from 'app/assets/images/iconCaretRight.svg'
import { Divider, Text } from 'app/components/core'
import { useNavigation } from 'app/hooks/useNavigation'
import type { StylesProp } from 'app/styles'
import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'
import { useThemeColors } from 'app/utils/theme'

import { InputErrorMessage } from './InputErrorMessage'
import { Pill } from './Pill'

export type ContextualSubmenuProps = {
  label: string
  value: any
  submenuScreenName: string
  styles?: StylesProp<{
    root: ViewStyle
    divider: ViewStyle
    content: ViewStyle
  }>
  error?: boolean
  errorMessage?: string
  lastItem?: boolean
  renderValue?: (value: any) => JSX.Element | null
}

const useStyles = makeStyles(({ spacing }) => ({
  content: {
    marginVertical: spacing(4)
  },
  select: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  optionPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing(2)
  },
  pill: {
    marginTop: spacing(2),
    marginRight: spacing(2)
  },
  optionPillText: {
    textTransform: 'uppercase'
  }
}))

export const ContextualSubmenu = (props: ContextualSubmenuProps) => {
  const {
    label,
    value,
    submenuScreenName,
    styles: stylesProp,
    errorMessage,
    error,
    lastItem,
    renderValue: renderValueProp
  } = props
  const styles = useStyles()

  const { neutralLight4 } = useThemeColors()
  const navigation = useNavigation()

  const handlePress = useCallback(() => {
    navigation.push(submenuScreenName)
  }, [navigation, submenuScreenName])

  const defaultRenderValue = (value: string | string[]) => {
    const values = typeof value === 'string' ? [value] : value

    return (
      <View style={styles.optionPills}>
        {values.map((value) => (
          <Pill key={value} style={styles.pill}>
            <Text
              fontSize='small'
              weight='demiBold'
              style={styles.optionPillText}
            >
              {value}
            </Text>
          </Pill>
        ))}
      </View>
    )
  }

  const renderValue = renderValueProp ?? defaultRenderValue
  console.log('renderValue?', renderValue)

  return (
    <TouchableOpacity onPress={handlePress} style={stylesProp?.root}>
      <Divider style={stylesProp?.divider} />
      <View style={[styles.content, stylesProp?.content]}>
        <View style={styles.select}>
          <Text fontSize='large' weight='demiBold'>
            {label}
          </Text>
          <IconCaretRight
            fill={neutralLight4}
            height={spacing(4)}
            width={spacing(4)}
          />
        </View>
        {value ? renderValue(value) : null}
        {error && errorMessage ? (
          <InputErrorMessage message={errorMessage} />
        ) : null}
      </View>
      {lastItem ? <Divider style={stylesProp?.divider} /> : null}
    </TouchableOpacity>
  )
}
