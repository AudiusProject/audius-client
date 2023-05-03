import {
  accountSelectors,
  chatSelectors,
  useSetInboxPermissions
} from '@audius/common'
import type { ID } from '@audius/common'
import type { ValidatedChatPermissions } from '@audius/sdk'
import { ChatPermission } from '@audius/sdk'
import { TouchableOpacity, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useSelector } from 'react-redux'
import { audiusSdk } from 'services/audius-sdk'

import IconMessage from 'app/assets/images/iconMessage.svg'
import { RadioButton, Text, Screen, ScreenContent } from 'app/components/core'
import { makeStyles } from 'app/styles'

const { getUserChatPermissions } = chatSelectors
const { getUserId } = accountSelectors

const messages = {
  title: 'Inbox Settings',
  allTitle: 'Allow Messages from Everyone',
  allDescription:
    'Anyone can send you a direct message, regardless of whether you follow them or not.',
  followeeTitle: 'Only Allow Messages From People You Follow',
  followeeDescription:
    'Only users that you follow can send you direct messages.',
  tipperTitle: 'Only Allow Messages From Your Supporters',
  tipperDescription:
    'Only users who have tipped you can send you direct messages.',
  noneTitle: 'No One Can Message You',
  noneDescription:
    'No one will be able to send you direct messages. Note that you will still be able to send messages to others.'
}

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  root: {
    display: 'flex'
  },
  settingsRow: {
    paddingHorizontal: spacing(4),
    backgroundColor: palette.white
  },
  settingsContent: {
    paddingVertical: spacing(8),
    borderBottomColor: palette.neutralLight7,
    borderBottomWidth: 1
  },
  radioTitleRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  radio: {
    marginRight: spacing(2)
  },
  title: {
    marginLeft: spacing(4),
    marginRight: spacing(6),
    color: palette.neutral,
    fontSize: typography.fontSize.large,
    fontFamily: typography.fontByWeight.bold,
    lineHeight: typography.fontSize.large * 1.5
  },
  text: {
    marginLeft: spacing(12),
    marginTop: spacing(2),
    paddingRight: spacing(6),
    color: palette.neutral,
    fontSize: typography.fontSize.large,
    lineHeight: typography.fontSize.large * 1.4
  },
  shadow: {
    borderBottomColor: palette.neutralLight7,
    borderBottomWidth: 2,
    borderBottomLeftRadius: 1
  }
}))

const options = [
  {
    title: messages.allTitle,
    description: messages.allDescription,
    value: ChatPermission.ALL
  },
  {
    title: messages.followeeTitle,
    description: messages.followeeDescription,
    value: ChatPermission.FOLLOWEES
  },
  {
    title: messages.tipperTitle,
    description: messages.tipperDescription,
    value: ChatPermission.TIPPERS
  },
  {
    title: messages.noneTitle,
    description: messages.noneDescription,
    value: ChatPermission.NONE
  }
]

export const InboxSettingsScreen = async () => {
  const styles = useStyles()
  const permissions: Record<ID, ValidatedChatPermissions> = useSelector(
    getUserChatPermissions
  )
  const userId = useSelector(getUserId)
  const initialPermission = userId ? permissions[userId]?.permits : undefined

  const { currentPermission, setCurrentPermission } = useSetInboxPermissions({
    audiusSdk,
    initialPermission
  })

  return (
    <Screen
      title={messages.title}
      variant='secondary'
      topbarRight={null}
      icon={IconMessage}
    >
      <View style={styles.shadow} />
      <ScreenContent>
        <ScrollView>
          {options.map((opt) => {
            return (
              <TouchableOpacity
                onPress={() => setCurrentPermission(opt.value)}
                key={opt.value}
              >
                <View style={styles.settingsRow}>
                  <View style={styles.settingsContent}>
                    <View style={styles.radioTitleRow}>
                      <RadioButton
                        checked={currentPermission === opt.value}
                        style={styles.radio}
                      />
                      <Text style={styles.title}>{opt.title}</Text>
                    </View>
                    <View>
                      <Text style={styles.text}>{opt.description}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </ScreenContent>
    </Screen>
  )
}
