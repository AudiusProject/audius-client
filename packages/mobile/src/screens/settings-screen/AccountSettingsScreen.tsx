import { useCallback, useContext } from 'react'

import { getAccountUser } from 'audius-client/src/common/store/account/selectors'
import { resendRecoveryEmail } from 'audius-client/src/common/store/recovery-email/slice'
import { setVisibility } from 'audius-client/src/common/store/ui/modals/slice'
import { Text, View } from 'react-native'

import Key from 'app/assets/images/emojis/key.png'
import Lock from 'app/assets/images/emojis/lock.png'
import StopSign from 'app/assets/images/emojis/octagonal-sign.png'
import Checkmark from 'app/assets/images/emojis/white-heavy-check-mark.png'
import IconMail from 'app/assets/images/iconMail.svg'
import IconSignOut from 'app/assets/images/iconSignOut.svg'
import IconVerified from 'app/assets/images/iconVerified.svg'
import { ScrollView, Screen } from 'app/components/core'
import { ToastContext } from 'app/components/toast/ToastContext'
import { ProfilePicture } from 'app/components/user'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useNavigation } from 'app/hooks/useNavigation'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { makeStyles } from 'app/styles'

import { ProfileTabScreenParamList } from '../app-screen/ProfileTabScreen'

import { AccountSettingsItem } from './AccountSettingsItem'

const messages = {
  title: 'Account',
  recoveryTitle: 'Recovery Email',
  recoveryDescription:
    'Store your recovery email safely. This email is the only way to recover your account if you forget your password.',
  recoveryButtonTitle: 'Resend',
  recoveryEmailSent: 'Recovery Email Sent!',
  verifyTitle: 'Get Verified',
  verifyDescription:
    'Get verified by linking a verified social account to Audius',
  verifyButtonTitle: 'Verification',
  passwordTitle: 'Change Password',
  passwordDescription: 'Change your password',
  passwordButtonTitle: 'Change',
  signOutTitle: 'Sign Out',
  signOutDescription:
    'Make sure you have your account recovery email stored somewhere safe before signing out!',
  signOutButtonTitle: 'Sign Out'
}

const useStyles = makeStyles(({ typography, palette, spacing }) => ({
  header: {
    alignItems: 'center',
    paddingTop: spacing(12),
    paddingBottom: spacing(6)
  },
  profilePhoto: {
    height: 128,
    width: 128
  },
  name: { ...typography.h2, color: palette.neutral, marginTop: spacing(1) },
  handle: {
    ...typography.h2,
    color: palette.neutral,
    fontFamily: typography.fontByWeight.medium
  }
}))

export const AccountSettingsScreen = () => {
  const styles = useStyles()
  const { toast } = useContext(ToastContext)
  const dispatchWeb = useDispatchWeb()
  const accountUser = useSelectorWeb(getAccountUser)
  const navigation = useNavigation<ProfileTabScreenParamList>()

  const handlePressRecoveryEmail = useCallback(() => {
    dispatchWeb(resendRecoveryEmail)
    toast({ content: messages.recoveryEmailSent })
  }, [dispatchWeb, toast])

  const handlePressVerification = useCallback(() => {
    navigation.push({
      native: { screen: 'AccountVerificationScreen', params: undefined },
      web: { route: '/settings/account/verification' }
    })
  }, [navigation])

  const handlePressChangePassword = useCallback(() => {
    navigation.push({
      native: { screen: 'ChangePasswordScreen', params: undefined },
      web: { route: '/settings/change-password' }
    })
  }, [navigation])

  const openSignOutDrawer = useCallback(() => {
    dispatchWeb(setVisibility({ modal: 'SignOutConfirmation', visible: true }))
  }, [dispatchWeb])

  if (!accountUser) return null

  const { name, handle } = accountUser

  return (
    <Screen title={messages.title} topbarRight={null} variant='secondary'>
      <ScrollView>
        <View style={styles.header}>
          <ProfilePicture profile={accountUser} style={styles.profilePhoto} />
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.handle}>@{handle}</Text>
        </View>
        <AccountSettingsItem
          title={messages.recoveryTitle}
          titleIconSource={Key}
          description={messages.recoveryDescription}
          buttonTitle={messages.recoveryButtonTitle}
          buttonIcon={IconMail}
          onPress={handlePressRecoveryEmail}
        />
        <AccountSettingsItem
          title={messages.verifyTitle}
          titleIconSource={Checkmark}
          description={messages.verifyDescription}
          buttonTitle={messages.verifyButtonTitle}
          buttonIcon={IconVerified}
          onPress={handlePressVerification}
        />
        <AccountSettingsItem
          title={messages.passwordTitle}
          titleIconSource={Lock}
          description={messages.passwordDescription}
          buttonTitle={messages.passwordButtonTitle}
          buttonIcon={IconMail}
          onPress={handlePressChangePassword}
        />
        <AccountSettingsItem
          title={messages.signOutTitle}
          titleIconSource={StopSign}
          description={messages.signOutDescription}
          buttonTitle={messages.signOutButtonTitle}
          buttonIcon={IconSignOut}
          onPress={openSignOutDrawer}
        />
      </ScrollView>
    </Screen>
  )
}
