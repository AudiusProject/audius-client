import { View } from 'react-native'

import { Text } from 'app/components/core'
import { TextField, type TextFieldProps } from 'app/components/fields'

type BoxedTextFieldProps = TextFieldProps & {
  title: string
  description: string
}

export const BoxedTextField = (props: BoxedTextFieldProps) => {
  const { title, description, ...other } = props
  return (
    <View>
      <Text>{title}</Text>
      <Text>{description}</Text>
      <TextField {...other} />
    </View>
  )
}
