import { useState, useCallback } from 'react'

import type { User } from '@audius/common'
import {
  searchUsersModalSelectors,
  searchUsersModalActions,
  useProxySelector,
  cacheUsersSelectors,
  Status
} from '@audius/common'
import { Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useDebounce } from 'react-use'

import IconCompose from 'app/assets/images/iconCompose.svg'
import IconSearch from 'app/assets/images/iconSearch.svg'
import { Screen, FlatList, ScreenContent, TextInput } from 'app/components/core'
import LoadingSpinner from 'app/components/loading-spinner'
import { ProfilePicture } from 'app/components/user'
import { UserBadges } from 'app/components/user-badges'
import { makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

const { searchUsers } = searchUsersModalActions
const { getUserList } = searchUsersModalSelectors
const { getUsers } = cacheUsersSelectors

const DEBOUNCE_MS = 100

const messages = {
  title: 'New Message',
  search: 'Search Users'
}

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  rootContainer: {
    // display: 'flex',
    // justifyContent: 'center',
    height: '100%',
    backgroundColor: palette.white
  },
  loadingSpinner: {
    height: spacing(20),
    width: spacing(20),
    alignSelf: 'center'
  },
  searchContainer: {
    marginTop: spacing(8),
    marginHorizontal: spacing(2),
    marginBottom: spacing(2)
  },
  searchIcon: {
    width: spacing(5),
    height: spacing(5)
  },
  searchInputContainer: {
    paddingRight: spacing(4.5),
    paddingVertical: spacing(4.5)
  },
  searchInputText: {
    fontWeight: '700'
  },
  userContainer: {
    display: 'flex',
    flexDirection: 'row',
    padding: spacing(4),
    borderBottomColor: palette.neutralLight4,
    borderBottomWidth: 1
  },
  userNameContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: spacing(2),
    marginLeft: spacing(2.5)
    // marginBottom: spacing(1)
  },
  userName: {
    fontSize: typography.fontSize.small,
    fontWeight: 'bold',
    color: palette.neutral
  },
  ProfilePicture: {
    height: spacing(18),
    width: spacing(18)
  },
  handle: {
    marginTop: spacing(1),
    fontSize: typography.fontSize.small,
    color: palette.neutral
  }
}))

type SearchUsersScreenProps = {
  debounceMs?: number
  defaultUserList?: {
    userIds: ID[]
    loadMore: () => void
    loading: boolean
    hasMore: boolean
  }
  renderUser: (user: User, closeModal: () => void) => ReactNode
}

export const ChatUserListScreen = (props: SearchUsersScreenProps) => {
  const {
    debounceMs = DEBOUNCE_MS,
    defaultUserList = {
      userIds: [],
      loading: false,
      loadMore: () => {},
      hasMore: false
    }
    // renderUser
  } = props
  const styles = useStyles()
  const palette = useThemeColors()
  const [query, setQuery] = useState('')
  const [hasQuery, setHasQuery] = useState(false)
  const dispatch = useDispatch()

  const { userIds, hasMore, status } = useSelector(getUserList)
  const users = useProxySelector(
    (state) => {
      const ids = hasQuery ? userIds : defaultUserList.userIds
      const users = getUsers(state, { ids })
      return ids.map((id) => users[id])
    },
    [hasQuery, userIds]
  )

  useDebounce(
    () => {
      dispatch(searchUsers({ query }))
      setHasQuery(!!query)
    },
    debounceMs,
    [query, setHasQuery, dispatch]
  )

  const handleChange = useCallback(
    (text: string) => {
      setQuery(text)
    },
    [setQuery]
  )

  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.userContainer}>
        <ProfilePicture profile={item} style={styles.profilePicture} />
        <View style={styles.userNameContainer}>
          <UserBadges user={item} nameStyle={styles.userName} />
          <Text style={styles.handle}>@{item.handle}</Text>
        </View>
      </View>
    )
  }

  return (
    <Screen
      url='/chat'
      title={messages.title}
      icon={IconCompose}
      topbarRight={null}
    >
      <ScreenContent>
        <View style={styles.rootContainer}>
          <View style={styles.searchContainer}>
            <TextInput
              placeholder={messages.search}
              Icon={() => (
                <IconSearch
                  fill={palette.neutralLight4}
                  width={styles.searchIcon.width}
                  height={styles.searchIcon.height}
                  // onPress={handleSearchPress}
                />
              )}
              styles={{
                root: styles.searchInputContainer,
                input: styles.searchInputText
              }}
              onChangeText={handleChange}
              value={query}
            />
          </View>

          {status === Status.SUCCESS ? (
            <FlatList
              data={users}
              renderItem={renderItem}
              keyExtractor={(user) => user.user_id}
            />
          ) : (
            <LoadingSpinner style={styles.loadingSpinner} />
          )}
        </View>
      </ScreenContent>
    </Screen>
  )
}
