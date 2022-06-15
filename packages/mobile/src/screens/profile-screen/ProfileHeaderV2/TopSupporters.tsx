import { useCallback } from 'react'

import { ID } from 'audius-client/src/common/models/Identifiers'
import { getUsers } from 'audius-client/src/common/store/cache/users/selectors'
import { getOptimisticSupportersForUser } from 'audius-client/src/common/store/tipping/selectors'
import { SupportersMapForUser } from 'audius-client/src/common/store/tipping/types'
import { Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'

import IconCaretRight from 'app/assets/images/iconCaretRight.svg'
import IconTrophy from 'app/assets/images/iconTrophy.svg'
import { useNavigation } from 'app/hooks/useNavigation'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { ProfilePictureList } from 'app/screens/notifications-screen/Notification'
import { makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

import { useSelectProfile } from '../selectors'

const messages = {
  topSupporters: 'Top Supporters',
  buttonTitle: 'View'
}

const MAX_PROFILE_SUPPORTERS_VIEW_ALL_USERS = 6

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  root: {
    padding: spacing(4),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profilePictureList: {
    marginRight: spacing(6)
  },
  profilePicture: {
    width: 28,
    height: 28
  },
  alignRowCenter: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    marginRight: spacing(2)
  },
  viewTopSupportersText: {
    marginRight: spacing(4),
    color: palette.neutral,
    fontSize: typography.fontSize.small,
    fontFamily: typography.fontByWeight.bold
  },
  viewTopSupportersButtonText: {
    marginRight: spacing(1),
    color: palette.secondary,
    fontSize: typography.fontSize.small,
    fontFamily: typography.fontByWeight.bold
  }
}))

export const TopSupporters = () => {
  const styles = useStyles()
  const { secondary, neutral } = useThemeColors()
  const navigation = useNavigation()
  const { user_id, supporter_count } = useSelectProfile([
    'user_id',
    'supporter_count'
  ])
  const supportersForProfile: SupportersMapForUser =
    useSelectorWeb(state => getOptimisticSupportersForUser(state, user_id)) ||
    {}
  const rankedSupporterIds = Object.keys(supportersForProfile)
    .sort((k1, k2) => {
      return (
        supportersForProfile[(k1 as unknown) as ID].rank -
        supportersForProfile[(k2 as unknown) as ID].rank
      )
    })
    .map(k => supportersForProfile[(k as unknown) as ID])
    .map(s => s.sender_id)
  const rankedSupporters = useSelectorWeb(state => {
    const usersMap = getUsers(state, { ids: rankedSupporterIds })
    return rankedSupporterIds.map(id => usersMap[id]).filter(Boolean)
  })

  const handlePress = useCallback(() => {
    navigation.push({
      native: {
        screen: 'TopSupporters',
        params: { userId: user_id, source: 'profile' }
      }
    })
  }, [navigation, user_id])

  return rankedSupporters.length > 0 ? (
    <View style={styles.root}>
      <ProfilePictureList
        users={rankedSupporters}
        totalUserCount={supporter_count}
        limit={MAX_PROFILE_SUPPORTERS_VIEW_ALL_USERS}
        style={styles.profilePictureList}
        navigationType='push'
        interactive={false}
        imageStyles={styles.profilePicture}
      />
      <View style={styles.alignRowCenter}>
        <IconTrophy style={styles.icon} fill={neutral} />
        <Text style={styles.viewTopSupportersText}>
          {messages.topSupporters}
        </Text>
        <TouchableOpacity style={styles.alignRowCenter} onPress={handlePress}>
          <Text style={styles.viewTopSupportersButtonText}>
            {messages.buttonTitle}
          </Text>
          <IconCaretRight fill={secondary} width={14} height={14} />
        </TouchableOpacity>
      </View>
    </View>
  ) : null
}
