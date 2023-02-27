import { accountSelectors } from '@audius/common'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { Text } from 'app/components/core'
import { NativeDrawer } from 'app/components/drawer'
import { getData } from 'app/store/drawers/selectors'
import { setVisibility } from 'app/store/drawers/slice'
import { makeStyles } from 'app/styles'

const BLOCK_MESSAGES_MODAL_NAME = 'BlockMessages'

const messages = {
  title: 'Are you sure?',
  confirmText:
    'Are you sure you want to block [Display Name] from sending messages to your inbox?',
  disclaimer:
    'This will not affect their ability to view your profile or interact with your content.',
  blockUser: 'Block User',
  cancel: 'Cancel'
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

export const ProfileActionsDrawer = () => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const userId = useSelector(getData)

  const handleConfirmPress = () => {
    dispatch(
      setVisibility({
        drawer: 'BlockMessages',
        visible: false
      })
    )
  }

  const handleCancelPress = () => {
    dispatch(
      setVisibility({
        drawer: 'BlockMessages',
        visible: false
      })
    )
  }

  return (
    <NativeDrawer drawerName={BLOCK_MESSAGES_MODAL_NAME}>
      <View style={styles.drawer}>
        <Text>{messages.title}</Text>
        <Text>{messages.confirmText}</Text>
        <Text>{messages.disclaimer}</Text>
        <Text style={styles.text} onPress={handleConfirmPress}>
          {messages.blockUser}
        </Text>
        <Text style={styles.text} onPress={handleCancelPress}>
          {messages.cancel}
        </Text>
      </View>
    </NativeDrawer>
  )
}
