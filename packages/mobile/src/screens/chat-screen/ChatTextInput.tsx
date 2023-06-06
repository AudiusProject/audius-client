import { useCallback, useState } from 'react'

import { chatActions, playerSelectors } from '@audius/common'
import { Platform, Pressable, View } from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'

import IconSend from 'app/assets/images/iconSend.svg'
import { TextInput } from 'app/components/core'
import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'
import { useThemeColors } from 'app/utils/theme'

const { sendMessage } = chatActions
const { getHasTrack } = playerSelectors

const ICON_BLUR = 0.5
const ICON_FOCUS = 1

const messages = {
  startNewMessage: ' Start a New Message'
}

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  composeTextContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    backgroundColor: palette.neutralLight10,
    paddingLeft: spacing(4),
    paddingVertical: spacing(1),
    borderRadius: spacing(1)
  },
  composeTextInput: {
    fontSize: typography.fontSize.medium,
    lineHeight: spacing(6),
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0
  },
  icon: {
    width: spacing(4),
    height: spacing(4),
    fill: palette.white
  },
  iconCircle: {
    borderRadius: spacing(5),
    paddingVertical: spacing(2),
    paddingLeft: 7,
    paddingRight: 9
  }
}))

type ChatTextInputProps = {
  chatId: string
}

export const ChatTextInput = ({ chatId }: ChatTextInputProps) => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const { primary, primaryDark2, accentRed, accentBlue } = useThemeColors()

  const [inputMessage, setInputMessage] = useState('')
  const [isPressed, setIsPressed] = useState(false)
  const hasCurrentlyPlayingTrack = useSelector(getHasTrack)
  console.log(`REED inputMessage: ${inputMessage} isPressed: ${isPressed}`)

  const handleSubmit = useCallback(
    (message) => {
      console.log(`REED onPress firing`)
      if (chatId && message) {
        setInputMessage('')
        dispatch(sendMessage({ chatId, message }))
      }
    },
    [chatId, dispatch]
  )

  const handlePressIn = useCallback(() => {
    console.log('REED onPressIn')
    setIsPressed(true)
  }, [])

  const handlePressOut = useCallback(() => {
    console.log('REED onPressOut')
    setIsPressed(false)
  }, [])

  return (
    <TextInput
      placeholder={messages.startNewMessage}
      Icon={() => (
        <Pressable
          onPress={() => handleSubmit(inputMessage)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.iconCircle,
            {
              backgroundColor:
                isPressed && inputMessage ? accentRed : accentBlue,
              opacity: inputMessage ? ICON_FOCUS : ICON_BLUR
            }
          ]}
        >
          <IconSend
            width={styles.icon.width}
            height={styles.icon.height}
            fill={styles.icon.fill}
          />
        </Pressable>
      )}
      styles={{
        root: styles.composeTextContainer,
        input: [
          styles.composeTextInput,
          Platform.OS === 'ios' ? { paddingBottom: spacing(1.5) } : null,
          { maxHeight: hasCurrentlyPlayingTrack ? spacing(70) : spacing(80) }
        ]
      }}
      onChangeText={(text) => {
        setInputMessage(text)
      }}
      inputAccessoryViewID='none'
      multiline
      value={inputMessage}
      maxLength={10000}
    />
  )
}
