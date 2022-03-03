import { StyleSheet, View } from 'react-native'

import IconQuestionMark from 'app/assets/images/iconQuestionMark.svg'
import { NativeDrawer } from 'app/components/drawer'
import Text from 'app/components/text'
import { useThemedStyles } from 'app/hooks/useThemedStyles'
import { useThemeColors, ThemeColors } from 'app/utils/theme'

const createStyles = (themeColors: ThemeColors) =>
  StyleSheet.create({
    mainView: {
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 24,
      paddingHorizontal: 24
    },

    headerView: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24
    },

    questionMarkIcon: {
      marginRight: 12
    },

    title: {
      fontSize: 18,
      fontWeight: '800',
      lineHeight: 22
    },

    bodyView: {
      display: 'flex',
      flexDirection: 'column'
    },

    restoreAccount: {
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
      marginBottom: 24
    },

    emailView: {
      display: 'flex',
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: themeColors.neutralLight6,
      borderRadius: 8,
      padding: 12,
      marginBottom: 45
    },

    emailSubHeadings: {
      display: 'flex',
      flexDirection: 'column'
    },

    fromHeader: {
      color: themeColors.neutralLight4,
      fontWeight: 'bold',
      fontSize: 16,
      lineHeight: 20,
      marginBottom: 12
    },

    subjectHeader: {
      color: themeColors.neutralLight4,
      fontWeight: 'bold',
      fontSize: 16,
      lineHeight: 20
    },

    emailContent: {
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: 24,
      flexShrink: 1
    },

    fromContent: {
      fontWeight: '600',
      fontSize: 16,
      lineHeight: 20,
      marginBottom: 12
    },

    subjectContent: {
      fontWeight: '600',
      fontSize: 16,
      lineHeight: 20
    }
  })

const messages = {
  forgotPassword: 'Forgot Your Password',
  restoreAccess:
    'To restore access to your account, please search for the email we sent when you first signed up.',
  fromHeader: 'From:',
  subjectHeader: 'Subject:',
  from: 'recovery@audius.co',
  subject: '"Save This Email: Audius Password Recovery"'
}

export const ForgotPasswordDrawer = () => {
  const styles = useThemedStyles(createStyles)
  const { neutral } = useThemeColors()

  return (
    <NativeDrawer drawerName='ForgotPassword'>
      <View style={styles.mainView}>
        <View style={styles.headerView}>
          <IconQuestionMark
            fill={neutral}
            style={styles.questionMarkIcon}
            height={20}
            width={20}
          />
          <Text style={styles.title}>{messages.forgotPassword}</Text>
        </View>
        <View style={styles.bodyView}>
          <Text style={styles.restoreAccount} weight='demiBold'>
            {messages.restoreAccess}
          </Text>
          <View style={styles.emailView}>
            <View style={styles.emailSubHeadings}>
              <Text style={styles.fromHeader}>{messages.fromHeader}</Text>
              <Text style={styles.subjectHeader}>{messages.subjectHeader}</Text>
            </View>
            <View style={styles.emailContent}>
              <Text style={styles.fromContent}>{messages.from}</Text>
              <Text style={styles.subjectContent}>{messages.subject}</Text>
            </View>
          </View>
        </View>
      </View>
    </NativeDrawer>
  )
}
