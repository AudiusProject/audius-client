import { ViewStyle } from 'react-native'

import Button from 'app/components/button'
import { font, makeStyles, WithStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'
import { useThemeColors } from 'app/utils/theme'

type HeaderButtonProps = WithStyles<
  {
    onPress: () => void
    text: string
  },
  { root: ViewStyle }
>

const useStyles = makeStyles(({ palette, typography }) => ({
  root: {
    height: 24,
    backgroundColor: palette.secondary,
    alignSelf: 'center'
  },
  button: {
    paddingVertical: spacing(0.5),
    paddingHorizontal: spacing(3)
  },
  text: {
    ...typography.body,
    ...font('bold'),
    margin: 0,
    color: palette.staticWhite
  }
}))

export const HeaderButton = ({ onPress, text, style }: HeaderButtonProps) => {
  const styles = useStyles()
  const { secondary } = useThemeColors()

  return (
    <Button
      style={styles.button}
      containerStyle={[styles.root, style]}
      underlayColor={secondary}
      textStyle={styles.text}
      onPress={onPress}
      title={text}
    />
  )
}
