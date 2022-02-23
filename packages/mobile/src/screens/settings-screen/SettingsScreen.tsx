import { Image } from 'react-native'

import audiusLogoHorizontal from 'app/assets/images/Horizontal-Logo-Full-Color.png'
import Bell from 'app/assets/images/emojis/bell.png'
import Headphone from 'app/assets/images/emojis/headphone.png'
import SpeechBalloon from 'app/assets/images/emojis/speech-balloon.png'
import Appearance from 'app/assets/images/emojis/waning-crescent-moon.png'
import { Screen, SegmentedControl } from 'app/components/core'
import { makeStyles } from 'app/styles'

import { AccountSettingsRow } from './AccountSettingsRow'
import { Divider } from './Divider'
import { SettingsRowLabel } from './SettingRowLabel'
import { SettingsRow } from './SettingsRow'
import { SettingsRowDescription } from './SettingsRowDescription'

const messages = {
  title: 'Settings',
  listeningHistory: 'Listening History',
  notifications: 'Notifications',
  appearance: 'Appearance',
  appearanceDescription:
    "Enable dark mode or choose 'Auto' to change with your system settings",
  about: 'About'
}

const useStyles = makeStyles(() => ({
  logo: {
    width: '80%',
    height: 85,
    marginVertical: 24,
    alignSelf: 'center'
  }
}))

export const SettingsScreen = () => {
  const styles = useStyles()
  return (
    <Screen title={messages.title}>
      <Image source={audiusLogoHorizontal} style={styles.logo} />
      <AccountSettingsRow />
      <SettingsRow onPress={() => null}>
        <SettingsRowLabel
          label={messages.listeningHistory}
          iconSource={Headphone}
        />
      </SettingsRow>
      <Divider />
      <SettingsRow onPress={() => null}>
        <SettingsRowLabel label={messages.notifications} iconSource={Bell} />
      </SettingsRow>
      <SettingsRow>
        <SettingsRowLabel label={messages.appearance} iconSource={Appearance} />
        <SettingsRowDescription>
          {messages.appearanceDescription}
        </SettingsRowDescription>
        <SegmentedControl
          fullWidth
          options={[
            { key: 'auto', text: 'Auto' },
            { key: 'dark', text: 'Dark' },
            { key: 'light', text: 'Light' }
          ]}
          defaultSelected='auto'
          onSelectOption={() => {}}
        />
      </SettingsRow>
      <Divider />
      <SettingsRow onPress={() => null}>
        <SettingsRowLabel label={messages.about} iconSource={SpeechBalloon} />
      </SettingsRow>
    </Screen>
  )
}
