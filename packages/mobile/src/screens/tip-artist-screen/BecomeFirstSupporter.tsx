import { View, Text } from "react-native"
import { makeStyles } from "app/styles"
import IconTrophy from 'app/assets/images/iconTrophy.svg'
import { useThemeColors } from "app/utils/theme"

const messages = {
  becomeFirstSupporter: 'Tip To Become Their First Supporter'
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
}))

export const BecomeFirstSupporter = () => {
  const styles = useStyles()
  const { white } = useThemeColors()

  return (
    <View style={styles.root}>
      <IconTrophy fill={white} />
      <Text>{messages.becomeFirstSupporter}</Text>
    </View>
  )
}
