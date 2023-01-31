import { useCallback } from 'react'

import type { SwitchProps as RNSwitchProps } from 'react-native'
import { Platform, Switch as RNSwitch } from 'react-native'
import { useToggle } from 'react-use'

import { light } from 'app/haptics'
import { useThemeColors } from 'app/utils/theme'

type SwitchProps = RNSwitchProps & {
  defaultValue?: boolean
}

const switchStyle = Platform.OS === 'ios' && {
  transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]
}

export const Switch = (props: SwitchProps) => {
  const {
    defaultValue = false,
    value,
    onValueChange: onValueChangeProp,
    style: styleProp,
    ...other
  } = props
  const { neutralLight6, white, secondary } = useThemeColors()
  const [isEnabledState, setIsEnabled] = useToggle(defaultValue)

  const isEnabled = value ?? isEnabledState

  const handleValueChange = useCallback(
    (value: boolean) => {
      onValueChangeProp?.(value)
      setIsEnabled(value)
      light()
    },
    [onValueChangeProp, setIsEnabled]
  )

  return (
    <RNSwitch
      style={[switchStyle, styleProp]}
      trackColor={{ false: neutralLight6, true: secondary }}
      thumbColor={white}
      value={isEnabled}
      onValueChange={handleValueChange}
      {...other}
    />
  )
}
