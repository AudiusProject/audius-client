import { View } from 'react-native'

import { Text } from 'app/components/core'
import { TextField, type TextFieldProps } from 'app/components/fields'
import { makeStyles } from 'app/styles'

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  root: {
    padding: spacing(4),
    gap: spacing(4),
    borderRadius: spacing(2),
    borderWidth: 1,
    borderColor: palette.neutralLight7,
    backgroundColor: palette.neutralLight10
  },
  textField: {
    marginVertical: 0,
    paddingHorizontal: 0
  },
  textInput: {
    backgroundColor: palette.white
  },
  test: {
    flex: 1,
    color: palette.neutral,
    minWidth: 40,
    flexGrow: 1,
    // Needed for android
    paddingTop: 0,
    paddingBottom: 0,
    fontSize: typography.fontSize.large,
    fontFamily: typography.fontByWeight.demiBold,
    lineHeight: 20
  }
}))

type BoxedTextFieldProps = TextFieldProps & {
  title: string
  description: string
}

export const BoxedTextField = (props: BoxedTextFieldProps) => {
  const { title, description, ...other } = props
  const styles = useStyles()

  return (
    <View style={styles.root}>
      <Text weight='bold'>{title}</Text>
      <Text>{description}</Text>
      <TextField
        style={styles.textField}
        styles={{ root: styles.textInput }}
        {...other}
      />
    </View>
  )
}
