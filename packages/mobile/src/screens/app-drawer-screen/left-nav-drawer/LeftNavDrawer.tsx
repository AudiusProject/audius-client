import type { User } from '@audius/common'
import {
  FeatureFlags,
  StringKeys,
  accountSelectors,
  useAccountHasClaimableRewards,
  chatSelectors
} from '@audius/common'
import type { DrawerContentComponentProps } from '@react-navigation/drawer'
import { DrawerContentScrollView } from '@react-navigation/drawer'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

import IconCrown from 'app/assets/images/iconCrown.svg'
import IconListeningHistory from 'app/assets/images/iconListeningHistory.svg'
import IconMessage from 'app/assets/images/iconMessage.svg'
import IconSettings from 'app/assets/images/iconSettings.svg'
import IconUpload from 'app/assets/images/iconUpload.svg'
import IconUser from 'app/assets/images/iconUser.svg'
import { useFeatureFlag, useRemoteVar } from 'app/hooks/useRemoteConfig'
import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'

import { AppDrawerContextProvider } from '../AppDrawerContext'

import { AccountDetails } from './AccountDetails'
import { LeftNavLink } from './LeftNavLink'
import { VanityMetrics } from './VanityMetrics'
const { getAccountUser } = accountSelectors
const { getHasUnreadMessages } = chatSelectors

const messages = {
  profile: 'Profile',
  audio: '$AUDIO & Rewards',
  upload: 'Upload a Track',
  listeningHistory: 'Listening History',
  settings: 'Settings'
}

type AccountDrawerProps = DrawerContentComponentProps & {
  gesturesDisabled: boolean
  setGesturesDisabled: (disabled: boolean) => void
}

const useStyles = makeStyles(({ spacing, palette }) => ({
  notificationBubble: {
    height: spacing(3),
    width: spacing(3),
    borderRadius: spacing(3),
    backgroundColor: palette.secondary,
    marginLeft: spacing(2)
  }
}))

export const LeftNavDrawer = (props: AccountDrawerProps) => {
  const { navigation: drawerHelpers, ...other } = props
  const accountUser = useSelector(getAccountUser) as User
  if (!accountUser) return null

  return (
    <AppDrawerContextProvider drawerHelpers={drawerHelpers} {...other}>
      <WrappedLeftNavDrawer />
    </AppDrawerContextProvider>
  )
}

const WrappedLeftNavDrawer = () => {
  const styles = useStyles()
  const challengeRewardIds = useRemoteVar(StringKeys.CHALLENGE_REWARD_IDS)
  const hasClaimableRewards = useAccountHasClaimableRewards(challengeRewardIds)
  const hasUnreadMessages = useSelector(getHasUnreadMessages)
  const { isEnabled: isChatEnabled } = useFeatureFlag(FeatureFlags.CHAT_ENABLED)

  return (
    <DrawerContentScrollView>
      <AccountDetails />
      <VanityMetrics />
      <LeftNavLink
        icon={IconUser}
        label={messages.profile}
        to='Profile'
        params={{ handle: 'accountUser' }}
      />
      {isChatEnabled ? (
        <LeftNavLink
          icon={IconMessage}
          label={'Messages'}
          to='ChatList'
          params={{}}
        >
          {hasUnreadMessages ? (
            <View style={styles.notificationBubble} />
          ) : null}
        </LeftNavLink>
      ) : null}
      <LeftNavLink
        icon={IconCrown}
        label={messages.audio}
        to='AudioScreen'
        params={null}
      >
        {hasClaimableRewards ? (
          <View style={styles.notificationBubble} />
        ) : null}
      </LeftNavLink>
      <LeftNavLink
        icon={IconUpload}
        iconProps={{
          height: spacing(8),
          width: spacing(8),
          style: { marginLeft: -2 }
        }}
        label={messages.upload}
        to='Upload'
        params={{ fromAppDrawer: false }}
      />
      <LeftNavLink
        icon={IconListeningHistory}
        label={messages.listeningHistory}
        to='ListeningHistoryScreen'
        params={null}
      />
      <LeftNavLink
        icon={IconSettings}
        label={messages.settings}
        to='SettingsScreen'
        params={null}
        iconProps={{
          height: spacing(9),
          width: spacing(9),
          style: { marginLeft: spacing(-1) }
        }}
      />
    </DrawerContentScrollView>
  )
}
