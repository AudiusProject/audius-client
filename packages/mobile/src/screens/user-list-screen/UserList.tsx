import { useCallback, useEffect, useMemo, useRef } from 'react'

import { CommonState } from 'audius-client/src/common/store'
import { getUserId } from 'audius-client/src/common/store/account/selectors'
import { getUsers } from 'audius-client/src/common/store/cache/users/selectors'
import { loadMore } from 'audius-client/src/common/store/user-list/actions'
import { UserListStoreState } from 'audius-client/src/common/store/user-list/types'
import { isEqual } from 'lodash'
import { FlatList } from 'react-native'
import { Selector } from 'react-redux'

import LoadingSpinner from 'app/components/loading-spinner'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { makeStyles } from 'app/styles'

import { UserChip } from './UserChip'

const useStyles = makeStyles(({ palette, spacing }) => ({
  root: { backgroundColor: palette.white },
  spinner: {
    marginTop: spacing(6),
    alignSelf: 'center',
    height: spacing(8),
    width: spacing(8)
  }
}))

type UserListProps = {
  /**
   * A tag uniquely identifying this particular instance of a UserList in the store.
   * Because multiple lists may exist, all listening to the same actions,
   * the tag is required to forward actions to a particular UserList.
   */
  tag: string
  /**
   * Selector pointing to this particular instance of the UserList
   * in the global store.
   */
  userSelector: Selector<CommonState, UserListStoreState>
}

export const UserList = (props: UserListProps) => {
  const styles = useStyles()
  const cachedUsers = useRef([])
  const { tag, userSelector } = props
  const dispatchWeb = useDispatchWeb()
  const { hasMore, userIds, loading } = useSelectorWeb(userSelector, isEqual)
  const currentUserId = useSelectorWeb(getUserId)
  const usersMap = useSelectorWeb(
    state => getUsers(state, { ids: userIds }),
    isEqual
  )
  const users = useMemo(
    () =>
      userIds
        .map(id => usersMap[id])
        .filter(user => user && !user.is_deactivated),
    [usersMap, userIds]
  )

  useEffect(() => {
    if (users.length !== 0) {
      cachedUsers.current = users
    }
  }, [users])

  const handleEndReached = useCallback(() => {
    if (hasMore) {
      dispatchWeb(loadMore(tag))
    }
  }, [hasMore, dispatchWeb, tag])

  if (loading && cachedUsers.current.length === 0) {
    return <LoadingSpinner style={styles.spinner} />
  }

  return (
    <FlatList
      style={styles.root}
      data={loading ? cachedUsers.current : users}
      renderItem={({ item }) => (
        <UserChip user={item} currentUserId={currentUserId} />
      )}
      onEndReached={handleEndReached}
    />
  )
}
