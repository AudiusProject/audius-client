import { useCallback } from 'react'

import {
  formatNumberCommas,
  accountSelectors,
  tippingSelectors
} from '@audius/common'
import { useNavigation } from '@react-navigation/native'
import { Platform } from 'react-native'

import IconCheck from 'app/assets/images/iconCheck.svg'
import IconRemove from 'app/assets/images/iconRemove.svg'
import { TextButton } from 'app/components/core'
import { TwitterButton } from 'app/components/twitter-button'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { make } from 'app/services/analytics'
import { makeStyles } from 'app/styles'
import { EventNames } from 'app/types/analytics'

import { TopBarIconButton } from '../app-screen'

import { DescriptionText } from './DescriptionText'
import { ReceiverDetails } from './ReceiverDetails'
import { TipHeader } from './TipHeader'
import { TipScreen } from './TipScreen'
const { getSendTipData } = tippingSelectors
const getAccountUser = accountSelectors.getAccountUser

const messages = {
  title: 'Tip Sent',
  // NOTE: Send tip -> Send $AUDIO change
  titleAlt: '$AUDIO Sent', // iOS only
  description: 'Share your support on Twitter!',
  done: 'Done',
  twitterCopyPrefix: 'I just tipped ',
  twitterCopyPrefixAlt: 'I just sent ', // iOS only
  twitterCopySuffix: ' $AUDIO on @AudiusProject #Audius #AUDIOTip',
  twitterCopySuffixAlt: ' $AUDIO on @AudiusProject #Audius #AUDIO' // iOS only
}

const useStyles = makeStyles(({ spacing }) => ({
  twitter: {
    marginBottom: spacing(6)
  },
  close: {
    alignSelf: 'center'
  }
}))

export const TipSentScreen = () => {
  const account = useSelectorWeb(getAccountUser)
  const {
    user: recipient,
    amount: sendAmount,
    source
  } = useSelectorWeb(getSendTipData)
  const styles = useStyles()
  const navigation = useNavigation()

  const getTwitterShareText = () => {
    const formattedSendAmount = formatNumberCommas(sendAmount)
    if (account && recipient) {
      let recipientAndAmount = `${recipient.name} ${formattedSendAmount}`
      if (recipient.twitter_handle) {
        recipientAndAmount = `@${recipient.twitter_handle} ${formattedSendAmount}`
      }
      return `${
        Platform.OS === 'ios'
          ? messages.twitterCopyPrefixAlt
          : messages.twitterCopyPrefix
      }${recipientAndAmount}${
        Platform.OS === 'ios'
          ? messages.twitterCopySuffixAlt
          : messages.twitterCopySuffix
      }`
    }
    return ''
  }

  const handleClose = useCallback(() => {
    navigation.getParent()?.goBack()
  }, [navigation])

  return (
    <TipScreen
      title={Platform.OS === 'ios' ? messages.titleAlt : messages.title}
      topbarLeft={<TopBarIconButton icon={IconRemove} onPress={handleClose} />}
    >
      <TipHeader status='sent' />
      <ReceiverDetails />
      <DescriptionText>{messages.description}</DescriptionText>
      <TwitterButton
        type='static'
        size='large'
        fullWidth
        styles={{ root: styles.twitter }}
        shareText={getTwitterShareText()}
        analytics={
          account && recipient
            ? make({
                eventName: EventNames.TIP_AUDIO_TWITTER_SHARE,
                senderWallet: account.spl_wallet,
                recipientWallet: recipient.spl_wallet,
                senderHandle: account.handle,
                recipientHandle: recipient.handle,
                amount: sendAmount,
                device: 'native',
                source
              })
            : undefined
        }
      />
      <TextButton
        variant='neutralLight4'
        title={messages.done}
        icon={IconCheck}
        iconPosition='left'
        TextProps={{ variant: 'h1', noGutter: true }}
        onPress={handleClose}
        style={styles.close}
      />
    </TipScreen>
  )
}
