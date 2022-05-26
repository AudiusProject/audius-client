import { getSendAmount } from 'audius-client/src/common/store/tipping/selectors'
import { View } from 'react-native'

import IconCheck from 'app/assets/images/iconCheck.svg'
import IconSend from 'app/assets/images/iconSend.svg'
import { Text, Audio } from 'app/components/core'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

const messages = {
  sending: 'Sending',
  sent: 'Sent Successfully'
}

const useStyles = makeStyles(({ spacing }) => ({
  header: {
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: spacing(6)
  },
  sending: {
    textTransform: 'uppercase',
    marginBottom: 0
  }
}))

type TipHeaderProps = {
  status: 'confirm' | 'sent'
}

export const TipHeader = (props: TipHeaderProps) => {
  const { status } = props
  const sendAmount = useSelectorWeb(getSendAmount)
  const styles = useStyles()
  const { neutralLight4 } = useThemeColors()
  const Icon = status === 'confirm' ? IconSend : IconCheck
  const title = status === 'confirm' ? messages.sending : messages.sent

  return (
    <View style={styles.header}>
      <Text>
        <Icon fill={neutralLight4} height={14} width={14} />{' '}
        <Text variant='h3' color='neutralLight4' style={styles.sending}>
          {title}
        </Text>
      </Text>
      <Text fontSize='xxxxl' weight='heavy'>
        {sendAmount}{' '}
        <Audio fontSize='xxxxl' color='neutralLight4' weight='heavy' />
      </Text>
    </View>
  )
}
