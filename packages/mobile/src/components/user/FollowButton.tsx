import { useCallback } from 'react'

import type { FollowSource, User } from '@audius/common'
import { usersSocialActions } from '@audius/common'
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native'
import { useDispatch } from 'react-redux'

import IconFollow from 'app/assets/images/iconFollow.svg'
import IconFollowing from 'app/assets/images/iconFollowing.svg'
import type { ButtonProps } from 'app/components/core'
import { Button } from 'app/components/core'
const { followUser, unfollowUser } = usersSocialActions

const messages = {
  follow: 'follow',
  following: 'following'
}

type FollowButtonsProps = Partial<ButtonProps> & {
  profile: Pick<User, 'does_current_user_follow' | 'user_id'>
  noIcon?: boolean
  style?: StyleProp<ViewStyle>
  followSource: FollowSource
}

export const FollowButton = (props: FollowButtonsProps) => {
  const { profile, noIcon, style, onPress, followSource, ...other } = props
  const { does_current_user_follow, user_id } = profile
  const isFollowing = does_current_user_follow
  const dispatch = useDispatch()

  const Icon = isFollowing ? IconFollowing : IconFollow

  const variant = isFollowing ? 'primary' : 'primaryAlt'

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      onPress?.(event)
      if (does_current_user_follow) {
        dispatch(unfollowUser(user_id, followSource))
      } else {
        dispatch(followUser(user_id, followSource))
      }
    },
    [onPress, dispatch, does_current_user_follow, user_id, followSource]
  )

  return (
    <Button
      style={style}
      title={isFollowing ? messages.following : messages.follow}
      haptics={!isFollowing}
      variant={variant}
      icon={noIcon ? undefined : Icon}
      iconPosition='left'
      size='small'
      onPress={handlePress}
      {...other}
    />
  )
}
