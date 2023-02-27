import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { Text } from 'app/components/core'
import { NativeDrawer } from 'app/components/drawer'
import { useNavigation } from 'app/hooks/useNavigation'
import { getData } from 'app/store/drawers/selectors'
import { setVisibility } from 'app/store/drawers/slice'
import { makeStyles } from 'app/styles'

const CHAT_ACTIONS_MODAL_NAME = 'ChatActions'

const messages = {
  visitProfile: 'Visit Profile',
  blockMessages: 'Block Messages'
}

const useStyles = makeStyles(({ spacing, typography, palette }) => ({
  drawer: {
    marginVertical: spacing(7),
    alignItems: 'center'
  },
  text: {
    fontSize: 21,
    lineHeight: spacing(6.5),
    letterSpacing: 0.233333,
    fontWeight: 700,
    color: palette.secondary,
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: palette.neutralLight9
  }
}))

export const ChatActionsDrawer = () => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const userId = useSelector(getData)

  const handleVisitProfilePress = () => {
    navigation.navigate('Profile', { id: userId })
    dispatch(
      setVisibility({
        drawer: 'ChatActions',
        visible: false
      })
    )
  }

  return (
    <NativeDrawer drawerName={CHAT_ACTIONS_MODAL_NAME}>
      <View style={styles.drawer}>
        <Text style={styles.text} onPress={handleVisitProfilePress}>
          {messages.visitProfile}
        </Text>
        <Text style={styles.text}>{messages.blockMessages}</Text>
      </View>
    </NativeDrawer>
  )
}
