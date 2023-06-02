import { View } from 'react-native'

import { makeStyles } from 'app/styles'
import { zIndex } from 'app/utils/zIndex'

const useStyles = makeStyles(({ palette }) => ({
  shadow: {
    height: 1,
    borderBottomWidth: 0,
    backgroundColor: palette.neutralLight8,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: zIndex.HEADER_SHADOW,
    shadowOffset: { width: 0, height: 2 }
  }
}))

/**
 * Hack: temporary component to add a shadow below mobile headers for DMs.
 * TODO: delete this and implement app wide header shadows [C-2709]
 */
export const HeaderShadow = () => {
  const styles = useStyles()
  return <View style={styles.shadow} />
}
