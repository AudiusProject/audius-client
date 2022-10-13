import { useCallback } from 'react'

import type { User } from '@audius/common'
import {
  formatCount,
  formatWei,
  walletSelectors,
  accountSelectors,
  useSelectTierInfo
} from '@audius/common'
import type { DrawerContentComponentProps } from '@react-navigation/drawer'
import { DrawerContentScrollView } from '@react-navigation/drawer'
import { Link } from '@react-navigation/native'
import { Pressable, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

import IconCrown from 'app/assets/images/iconCrown.svg'
import IconNote from 'app/assets/images/iconNote.svg'
import IconSettings from 'app/assets/images/iconSettings.svg'
import IconUserFollowers from 'app/assets/images/iconUserFollowers.svg'
import IconUserList from 'app/assets/images/iconUserList.svg'
import { IconAudioBadge } from 'app/components/audio-rewards'
import { Divider, Text } from 'app/components/core'
import { ProfilePicture } from 'app/components/user'
import { makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

import { useAppDrawerNavigation } from '../app-drawer-screen'
const { getAccountUser } = accountSelectors
const { getAccountTotalBalance } = walletSelectors

const messages = {
  audio: '$AUDIO & Rewards',
  settings: 'Settings'
}

type AccountDrawerProps = DrawerContentComponentProps

const useStyles = makeStyles(() => ({
  root: {},
  header: {
    flexDirection: 'row'
  },
  accountInfo: {},
  tokens: {},
  accountStats: { flexDirection: 'row' },
  accountStat: {
    flexDirection: 'row'
  },
  accountListItem: {
    flexDirection: 'row'
  }
}))

export const AccountDrawer = (props: AccountDrawerProps) => {
  const styles = useStyles()
  const accountUser = useSelector(getAccountUser) as User
  const { user_id, track_count, followee_count, follower_count } = accountUser
  const { tier } = useSelectTierInfo(user_id)
  const totalBalance = useSelector(getAccountTotalBalance)
  const { neutral, neutralLight4 } = useThemeColors()

  const navigation = useAppDrawerNavigation()

  const handlePressAccount = useCallback(() => {
    navigation.navigate('Profile', { handle: 'accountUser' })
  }, [navigation])

  const handlePressRewards = useCallback(() => {
    navigation.navigate('AudioScreen')
  }, [navigation])

  const handlePressSettings = useCallback(() => {
    navigation.navigate('SettingsScreen')
  }, [navigation])

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Pressable style={styles.accountInfo} onPress={handlePressAccount}>
          <ProfilePicture profile={accountUser} />
          <Text>{accountUser?.name}</Text>
          <Text>{accountUser?.handle}</Text>
        </Pressable>
        <View style={styles.tokens}>
          <IconAudioBadge tier={tier} />
          {/* <Text>{formatWei(totalBalance ?? 0)}</Text> */}
        </View>
      </View>
      <Divider />
      <View style={styles.accountStats}>
        <View style={styles.accountStat}>
          <IconNote fill={neutralLight4} />
          <Text>{formatCount(track_count)}</Text>
        </View>
        <View style={styles.accountStat}>
          <IconUserFollowers fill={neutralLight4} />
          <Text>{formatCount(follower_count)}</Text>
        </View>
        <View style={styles.accountStat}>
          <IconUserList fill={neutralLight4} />
          <Text>{formatCount(followee_count)}</Text>
        </View>
      </View>
      <Divider />
      <TouchableOpacity
        style={styles.accountListItem}
        onPress={handlePressRewards}
      >
        <IconCrown fill={neutral} />
        <Text>{messages.audio}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.accountListItem}
        onPress={handlePressSettings}
      >
        <IconSettings fill={neutral} />
        <Text>{messages.settings}</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  )
}
