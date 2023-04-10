import { useCallback, useState } from 'react'

import { chatActions } from '@audius/common'
import { Platform } from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { useDispatch } from 'react-redux'

import IconSend from 'app/assets/images/iconSend.svg'
import { TextInput } from 'app/components/core'
import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'

const { sendMessage } = chatActions

const ICON_BLUR = 0.5
const ICON_FOCUS = 1

const messages = {
  startNewMessage: 'Start a New Message'
}

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  composeTextContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: palette.neutralLight10,
    paddingLeft: spacing(4),
    borderRadius: spacing(1)
  },
  composeTextInput: {
    fontSize: typography.fontSize.medium,
    lineHeight: spacing(6),
    paddingTop: 0
  },
  icon: {
    width: spacing(7),
    height: spacing(7),
    fill: palette.primary
  }
}))

type ChatTextInputProps = {
  chatId: string
}

export const ChatTextInput = ({ chatId }: ChatTextInputProps) => {
  const styles = useStyles()
  const dispatch = useDispatch()

  const [inputMessage, setInputMessage] = useState('')

  const handleSubmit = useCallback(
    (message) => {
      if (chatId && message) {
        setInputMessage('')
        dispatch(sendMessage({ chatId, message }))
      }
    },
    [chatId, setInputMessage, dispatch]
  )

  return (
    <TextInput
      placeholder={messages.startNewMessage}
      Icon={() => (
        <TouchableWithoutFeedback onPress={() => handleSubmit(inputMessage)}>
          <IconSend
            width={styles.icon.width}
            height={styles.icon.height}
            opacity={inputMessage ? ICON_FOCUS : ICON_BLUR}
            fill={styles.icon.fill}
          />
        </TouchableWithoutFeedback>
      )}
      styles={{
        root: styles.composeTextContainer,
        input: [
          styles.composeTextInput,
          Platform.OS === 'ios' ? { paddingBottom: spacing(1) } : null
        ]
      }}
      onChangeText={(text) => {
        setInputMessage(text)
      }}
      inputAccessoryViewID='none'
      multiline
      value={inputMessage}
    />
  )
}
