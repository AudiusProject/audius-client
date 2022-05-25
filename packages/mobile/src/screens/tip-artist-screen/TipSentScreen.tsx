import { Screen, Text } from 'app/components/core'

const messages = {
  title: 'Tip Sent',
  sent: 'Sent Successfully'
}

export const TipSentScreen = () => {
  return (
    <Screen title={messages.title}>
      <Text>{messages.sent}</Text>
    </Screen>
  )
}
