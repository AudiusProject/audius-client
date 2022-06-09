import { useCallback } from 'react'

import { getUser } from 'audius-client/src/common/store/cache/users/selectors'
import { setTopSupporters } from 'audius-client/src/common/store/user-list/top-supporters/actions'
import {
  getUserList,
  getId as getSupportersId
} from 'audius-client/src/common/store/user-list/top-supporters/selectors'
import { View } from 'react-native'

import IconTrophy from 'app/assets/images/iconTrophy.svg'
import { Screen, Text } from 'app/components/core'
import UserBadges from 'app/components/user-badges'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useRoute } from 'app/hooks/useRoute'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { makeStyles } from 'app/styles'

import { UserList } from './UserList'
import { UserListTitle } from './UserListTitle'

const messages = {
  title: 'Top Supporters'
}

const useStyles = makeStyles(({ spacing }) => ({
  titleNameContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: -spacing(3)
  },
  titleName: {
    maxWidth: 120
  },
  badge: {
    marginTop: -spacing(1)
  }
}))

const HeaderTitle = ({ source }: { source: 'profile' | 'feed' }) => {
  const styles = useStyles()
  const supportersId = useSelectorWeb(getSupportersId)
  const supportersUser = useSelectorWeb(state =>
    getUser(state, { id: supportersId })
  )

  const title =
    source === 'feed' && supportersUser ? (
      <View style={styles.titleNameContainer}>
        <Text variant='h3' style={styles.titleName} numberOfLines={1}>
          {supportersUser.name}
        </Text>
        <UserBadges
          style={styles.badge}
          user={supportersUser}
          badgeSize={12}
          hideName
        />
        <Text variant='h3'>&apos;s&nbsp;{messages.title}</Text>
      </View>
    ) : (
      messages.title
    )

  return <UserListTitle icon={IconTrophy} title={title} />
}

export const TopSupportersScreen = () => {
  const { params } = useRoute<'TopSupporters'>()
  const { userId, source } = params
  const dispatchWeb = useDispatchWeb()

  const handleSetSupporters = useCallback(() => {
    dispatchWeb(setTopSupporters(userId))
  }, [dispatchWeb, userId])

  return (
    <Screen headerTitle={() => <HeaderTitle source={source} />} variant='white'>
      <UserList
        userSelector={getUserList}
        tag='TOP SUPPORTERS'
        setUserList={handleSetSupporters}
      />
    </Screen>
  )
}
