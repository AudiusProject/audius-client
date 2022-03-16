import { ComponentType } from 'react'

import { useField } from 'formik'
import { View, TextInput, Text, TextInputProps, Dimensions } from 'react-native'
import { SvgProps } from 'react-native-svg'

import { makeStyles } from 'app/styles'

const useStyles = makeStyles(({ typography, palette, spacing }) => {
  const inputText = { ...typography.body, color: palette.secondary }

  return {
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: palette.neutralLight8,
      minHeight: spacing(10),
      width: Dimensions.get('window').width
    },
    firstInput: {
      borderTopWidth: 1,
      borderTopColor: palette.neutralLight8
    },
    label: {
      minWidth: 100,
      marginLeft: spacing(4),
      ...typography.body,
      color: palette.neutral
    },
    input: { ...inputText, width: '100%', flexShrink: 1 },
    prefix: inputText
  }
})

type ProfileTextInputProps = TextInputProps & {
  name: string
  label: string
  icon?: ComponentType<SvgProps>
  prefix?: string
  onChange?: any
  isFirstInput?: boolean
}

export const FormTextInput = (props: ProfileTextInputProps) => {
  const styles = useStyles()
  const { name, label, icon: Icon, isFirstInput, prefix, ...other } = props
  const [{ value, onChange, onBlur }] = useField<string>(name)

  return (
    <View style={[styles.root, isFirstInput && styles.firstInput]}>
      {Icon ? (
        <View style={styles.label}>
          <Icon
            accessibilityLabel={label}
            fill={styles.label.color}
            height={24}
            width={24}
          />
        </View>
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
      {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
      <TextInput
        style={styles.input}
        onBlur={onBlur(name)}
        onChangeText={onChange(name)}
        value={value ?? ''}
        maxLength={200}
        {...other}
      />
    </View>
  )
}
