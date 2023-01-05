import { useCallback, useContext } from 'react'

import type { User } from '@audius/common'
import {
  StringKeys,
  formatWei,
  walletSelectors,
  accountSelectors,
  useSelectTierInfo,
  useAccountHasClaimableRewards
} from '@audius/common'
import type { DrawerContentComponentProps } from '@react-navigation/drawer'
import { DrawerContentScrollView } from '@react-navigation/drawer'
import { TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

import IconCrown from 'app/assets/images/iconCrown.svg'
import IconListeningHistory from 'app/assets/images/iconListeningHistory.svg'
import IconSettings from 'app/assets/images/iconSettings.svg'
import IconUpload from 'app/assets/images/iconUpload.svg'
import IconUser from 'app/assets/images/iconUser.svg'
import { IconAudioBadge } from 'app/components/audio-rewards'
import { Text } from 'app/components/core'
import { ProfilePicture } from 'app/components/user'
import UserBadges from 'app/components/user-badges'
import { useRemoteVar } from 'app/hooks/useRemoteConfig'
import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'

import { AppDrawerContext, AppDrawerContextProvider } from '../AppDrawerContext'
import { useAppDrawerNavigation } from '../useAppDrawerNavigation'

import { LeftNavLink } from './LeftNavLink'
import { VanityMetrics } from './VanityMetrics'
const { getAccountUser } = accountSelectors
const { getAccountTotalBalance } = walletSelectors

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
  header: {
    paddingLeft: spacing(4),
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  accountImage: {
    height: spacing(12.5),
    width: spacing(12.5),
    marginBottom: spacing(3),
    borderWidth: 1
  },
  accountName: { flexDirection: 'row' },
  accountBadges: { alignSelf: 'center' },
  tokens: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing(4)
  },
  tokenBadge: {
    marginRight: spacing(1)
  },
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
  const { drawerHelpers } = useContext(AppDrawerContext)
  const styles = useStyles()
  const accountUser = useSelector(getAccountUser) as User
  const { user_id, name, handle } = accountUser
  const { tier } = useSelectTierInfo(user_id)
  const totalBalance = useSelector(getAccountTotalBalance)
  const challengeRewardIds = useRemoteVar(StringKeys.CHALLENGE_REWARD_IDS)
  const hasClaimableRewards = useAccountHasClaimableRewards(challengeRewardIds)

  const navigation = useAppDrawerNavigation()

  const handlePressAccount = useCallback(() => {
    navigation.push('Profile', { handle: 'accountUser' })
    drawerHelpers.closeDrawer()
  }, [navigation, drawerHelpers])

  const handlePressRewards = useCallback(() => {
    navigation.push('AudioScreen')
    drawerHelpers.closeDrawer()
  }, [navigation, drawerHelpers])

  return (
    <DrawerContentScrollView>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePressAccount}>
          <ProfilePicture profile={accountUser} style={styles.accountImage} />
          <View style={styles.accountName}>
            <Text variant='h1' noGutter>
              {name}
            </Text>
            <UserBadges
              user={accountUser}
              hideName
              style={styles.accountBadges}
            />
          </View>
          <Text weight='medium' fontSize='medium'>
            @{handle}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tokens} onPress={handlePressRewards}>
          <IconAudioBadge
            tier={tier}
            showNoTier
            style={styles.tokenBadge}
            height={spacing(7)}
            width={spacing(7)}
          />
          <Text fontSize='large' weight='heavy'>
            {formatWei(totalBalance, true, 0)}
          </Text>
        </TouchableOpacity>
      </View>
      <VanityMetrics />
      <LeftNavLink
        icon={IconUser}
        label={messages.profile}
        to='Profile'
        params={{ handle: 'accountUser' }}
      />
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
