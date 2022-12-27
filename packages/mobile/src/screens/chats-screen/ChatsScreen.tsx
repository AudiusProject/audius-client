import { useEffect } from 'react'

import { chatActions, chatSelectors } from '@audius/common'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { Screen, Text } from 'app/components/core'

export const ChatsScreen = () => {
  const dispatch = useDispatch()
  const chats = useSelector(chatSelectors.getChats)

  useEffect(() => {
    dispatch(chatActions.fetchMoreChats())
  }, [dispatch])

  return (
    <Screen>
      <View>
        <Text>Hello world {chats?.length}</Text>
      </View>
    </Screen>
  )
}
