import codePush from 'react-native-code-push'

import { NewVersionPrompt } from './NewVersionPrompt'

const messages = {
  header: 'Please Restart ✨',
  text: 'We need to apply some updates to your app.',
  buttonText: 'Restart App'
}

export const RestartRequiredScreen = () => {
  return (
    <NewVersionPrompt
      headerText={messages.header}
      contentText={messages.text}
      buttonText={messages.buttonText}
      onPress={() => {
        codePush.restartApp()
      }}
    />
  )
}
