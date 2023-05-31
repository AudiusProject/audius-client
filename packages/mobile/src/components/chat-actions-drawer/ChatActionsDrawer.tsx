import { useCallback } from 'react'

import { chatSelectors } from '@audius/common'
import { View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'

import { Text } from 'app/components/core'
import { NativeDrawer } from 'app/components/drawer'
import { useNavigation } from 'app/hooks/useNavigation'
import type { AppState } from 'app/store'
import { getData } from 'app/store/drawers/selectors'
import { setVisibility } from 'app/store/drawers/slice'
import { makeStyles } from 'app/styles'

const { getDoesBlockUser } = chatSelectors

const CHAT_ACTIONS_MODAL_NAME = 'ChatActions'

const messages = {
  visitProfile: 'Visit Profile',
  blockMessages: 'Block Messages',
  unblockMessages: 'Unblock Messages',
  deleteConversation: 'Delete Conversation'
}

const useStyles = makeStyles(({ spacing, typography, palette }) => ({
  drawer: {
    marginVertical: spacing(7)
  },
  text: {
    fontSize: 21,
    lineHeight: spacing(6.5),
    letterSpacing: 0.233333,
    fontFamily: typography.fontByWeight.demiBold,
    color: palette.secondary,
    paddingVertical: spacing(3)
  },
  deleteText: {
    color: palette.accentRed
  },
  row: {
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: palette.neutralLight9
  }
}))

export const ChatActionsDrawer = () => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const { userId, chatId } = useSelector((state: AppState) =>
    getData<'ChatActions'>(state)
  )
  const doesBlockUser = useSelector((state: AppState) =>
    getDoesBlockUser(state, userId)
  )

  const closeDrawer = useCallback(() => {
    dispatch(
      setVisibility({
        drawer: 'ChatActions',
        visible: false
      })
    )
  }, [dispatch])

  const handleVisitProfilePress = useCallback(() => {
    closeDrawer()
    navigation.navigate('Profile', { id: userId })
  }, [closeDrawer, navigation, userId])

  const handleBlockMessagesPress = useCallback(() => {
    closeDrawer()
    dispatch(
      setVisibility({
        drawer: 'BlockMessages',
        visible: true,
        data: { userId }
      })
    )
  }, [closeDrawer, dispatch, userId])

  const handleDeletePress = useCallback(() => {
    closeDrawer()
    dispatch(
      setVisibility({
        drawer: 'DeleteChat',
        visible: true,
        data: { chatId }
      })
    )
  }, [chatId, closeDrawer, dispatch])

  return (
    <NativeDrawer drawerName={CHAT_ACTIONS_MODAL_NAME}>
      <View style={styles.drawer}>
        <View style={styles.row}>
          <TouchableOpacity onPress={handleVisitProfilePress}>
            <Text style={styles.text}>{messages.visitProfile}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity onPress={handleBlockMessagesPress}>
            <Text style={styles.text}>
              {doesBlockUser
                ? messages.unblockMessages
                : messages.blockMessages}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity onPress={handleDeletePress}>
            <Text style={[styles.text, styles.deleteText]}>
              {messages.deleteConversation}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </NativeDrawer>
  )
}
