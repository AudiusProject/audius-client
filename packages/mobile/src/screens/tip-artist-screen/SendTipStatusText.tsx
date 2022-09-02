import { tippingSelectors } from '@audius/common'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

import { DescriptionText } from './DescriptionText'
const { getSendStatus } = tippingSelectors

const messages = {
  disclaimer: 'Are you sure? This tip cannot be reversed.',
  maintenance: 'We’re performing some necessary one-time maintenance.',
  fewMinutes: 'This may take a few minutes.',
  holdOn: 'Don’t close this screen or restart the app.',
  somethingWrong: 'Something’s gone wrong. Wait a little while and try again.'
}

export const SendTipStatusText = () => {
  const sendStatus = useSelector(getSendStatus)

  if (sendStatus === 'CONFIRM')
    return <DescriptionText>{messages.disclaimer}</DescriptionText>
  if (sendStatus === 'SENDING') return null
  if (sendStatus === 'CONVERTING')
    return (
      <View>
        <DescriptionText>{messages.maintenance}</DescriptionText>
        <DescriptionText>
          {messages.fewMinutes} {'\n'}
          {messages.holdOn}
        </DescriptionText>
      </View>
    )
  if (sendStatus === 'ERROR')
    return (
      <DescriptionText color='error'>{messages.somethingWrong}</DescriptionText>
    )

  return null
}
