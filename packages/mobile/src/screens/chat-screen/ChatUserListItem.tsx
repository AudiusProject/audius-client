import { useCallback } from 'react'

import {
  chatActions,
  accountSelectors,
  chatSelectors,
  ChatPermissionAction,
  cacheUsersSelectors
} from '@audius/common'
import { useSelector } from 'audius-client/src/common/hooks/useSelector'
import { Text, View, TouchableOpacity, Keyboard } from 'react-native'
import { useDispatch } from 'react-redux'

import IconBlockMessages from 'app/assets/images/iconBlockMessages.svg'
import IconKebabHorizontal from 'app/assets/images/iconKebabHorizontal.svg'
import IconUser from 'app/assets/images/iconUser.svg'
import { ProfilePicture } from 'app/components/user'
import { UserBadges } from 'app/components/user-badges'
import { setVisibility } from 'app/store/drawers/slice'
import { makeStyles } from 'app/styles'

const { createChat } = chatActions
const { getCanCreateChat } = chatSelectors
const { getUserId } = accountSelectors
const { getUser } = cacheUsersSelectors

const messages = {
  followsYou: 'Follows You',
  followers: 'Followers',
  ctaNone: 'Cannot Be Messaged',
  ctaTip: 'Send a Tip To Message',
  ctaBlock: 'Blocked'
}

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  rootContainer: {
    backgroundColor: palette.white,
    flexGrow: 1
  },
  profilePicture: {
    height: spacing(18),
    width: spacing(18)
  },
  border: {
    borderBottomColor: palette.neutralLight8,
    borderBottomWidth: 1
  },
  userContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(4)
  },
  userDetailsContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: spacing(2.5),
    gap: spacing(1)
  },
  topHalfContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  userNameContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing(1)
  },
  userName: {
    fontSize: typography.fontSize.small,
    fontWeight: 'bold',
    color: palette.neutral
  },
  followContainer: {
    marginTop: spacing(1),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  handle: {
    fontSize: typography.fontSize.small,
    color: palette.neutral
  },
  followersContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  ctaContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    backgroundColor: palette.neutralLight9,
    borderWidth: 1,
    borderColor: palette.neutralLight7,
    borderRadius: spacing(1),
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(1.5)
  },
  followersCount: {
    fontWeight: 'bold',
    marginHorizontal: spacing(1),
    color: palette.neutralLight4,
    fontSize: typography.fontSize.small
  },
  followers: {
    color: palette.neutralLight4,
    fontSize: typography.fontSize.small
  },
  iconUser: {
    height: spacing(4),
    width: spacing(4),
    fill: palette.neutralLight4
  },
  iconBlock: {
    height: spacing(4),
    width: spacing(4),
    fill: palette.neutral
  },
  iconKebab: {
    height: spacing(6),
    width: spacing(6),
    fill: palette.neutral
  },
  followsYouTag: {
    fontSize: typography.fontSize.xxs,
    fontFamily: typography.fontByWeight.heavy,
    letterSpacing: 0.64,
    textTransform: 'uppercase',
    color: palette.neutralLight4,
    borderWidth: 1,
    borderRadius: spacing(1),
    borderColor: palette.neutralLight4,
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(2)
  },
  dim: {
    opacity: 0.5
  }
}))

const ctaToTextMap = {
  [ChatPermissionAction.TIP]: messages.ctaTip,
  [ChatPermissionAction.UNBLOCK]: messages.ctaBlock,
  [ChatPermissionAction.NONE]: messages.ctaNone
}

type ChatUserListItemProps = {
  userId: number
}

export const ChatUserListItem = ({ userId }: ChatUserListItemProps) => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const user = useSelector((state) => getUser(state, { id: userId }))
  const currentUserId = useSelector(getUserId)
  const { callToAction, canCreateChat } = useSelector((state) =>
    getCanCreateChat(state, { userId: user?.user_id })
  )

  const handlePress = useCallback(() => {
    if (user?.user_id) {
      Keyboard.dismiss()
      dispatch(createChat({ userIds: [user.user_id] }))
    }
  }, [dispatch, user?.user_id])

  const handleNotPermittedPress = useCallback(() => {
    if (user?.user_id) {
      Keyboard.dismiss()
      dispatch(
        setVisibility({
          drawer: 'InboxUnavailable',
          visible: true,
          data: { userId: user.user_id, navigateToChat: true }
        })
      )
    }
  }, [dispatch, user?.user_id])

  const handleKebabPress = useCallback(() => {
    if (user?.user_id) {
      Keyboard.dismiss()
      dispatch(
        setVisibility({
          drawer: 'CreateChatActions',
          visible: true,
          data: { userId: user.user_id }
        })
      )
    }
  }, [dispatch, user?.user_id])

  if (!user || currentUserId === user?.user_id) {
    return null
  }

  return (
    <TouchableOpacity
      onPress={canCreateChat ? handlePress : handleNotPermittedPress}
    >
      <View style={styles.border}>
        <View style={styles.userContainer}>
          <ProfilePicture
            profile={user}
            style={[styles.profilePicture, !canCreateChat ? styles.dim : null]}
          />
          <View style={styles.userDetailsContainer}>
            <View style={styles.topHalfContainer}>
              <View style={styles.userNameContainer}>
                <UserBadges user={user} nameStyle={styles.userName} />
                <Text style={styles.handle}>@{user.handle}</Text>
              </View>
              <TouchableOpacity onPress={handleKebabPress}>
                <IconKebabHorizontal
                  height={styles.iconKebab.height}
                  width={styles.iconKebab.width}
                  fill={styles.iconKebab.fill}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.followContainer}>
              <View style={styles.followersContainer}>
                {canCreateChat ? (
                  <>
                    <IconUser
                      fill={styles.iconUser.fill}
                      height={styles.iconUser.height}
                      width={styles.iconUser.width}
                    />
                    <Text style={styles.followersCount}>
                      {user.follower_count}
                    </Text>
                    <Text style={styles.followers}>{messages.followers}</Text>
                  </>
                ) : (
                  <View style={styles.ctaContainer}>
                    <IconBlockMessages
                      fill={styles.iconBlock.fill}
                      width={styles.iconBlock.width}
                      height={styles.iconBlock.height}
                    />
                    <Text style={styles.userName}>
                      {ctaToTextMap[callToAction]}
                    </Text>
                  </View>
                )}
              </View>
              {user.does_follow_current_user && canCreateChat ? (
                <Text style={styles.followsYouTag}>{messages.followsYou}</Text>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}
