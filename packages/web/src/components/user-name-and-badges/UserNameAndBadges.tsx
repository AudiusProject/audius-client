import { useCallback } from 'react'

import { UserMetadata, accountSelectors, useGetUserById } from '@audius/common'
import { useSelector } from 'react-redux'

import { ArtistPopover } from 'components/artist/ArtistPopover'
import UserBadges from 'components/user-badges/UserBadges'
import { useGoToRoute } from 'hooks/useGoToRoute'
import { profilePage } from 'utils/route'

import styles from './UserNameAndBadges.module.css'

const { getUserId } = accountSelectors

type BaseUserNameAndBadgesProps = {
  onNavigateAway?: () => void
  classes?: {
    name?: string
  }
}
type UserNameAndBadgesImplProps = BaseUserNameAndBadgesProps & {
  user: UserMetadata
}
type UserNameAndBadgesWithIdProps = BaseUserNameAndBadgesProps & {
  userId: number
}
type UserNameAndBadgesProps =
  | UserNameAndBadgesImplProps
  | UserNameAndBadgesWithIdProps

const UserNameAndBadgesImpl = (props: UserNameAndBadgesImplProps) => {
  const { user, onNavigateAway, classes } = props
  const goToRoute = useGoToRoute()
  const goToProfile = useCallback(() => {
    goToRoute(profilePage(user.handle))
    onNavigateAway?.()
  }, [goToRoute, onNavigateAway, user])
  if (!user) {
    return null
  }
  return (
    <ArtistPopover
      handle={user.handle}
      component='span'
      onNavigateAway={onNavigateAway}
    >
      <div className={styles.nameAndBadge} onClick={goToProfile}>
        <span className={classes?.name}>{user.name}</span>
        <UserBadges
          userId={user.user_id}
          className={styles.badges}
          badgeSize={14}
          inline
        />
      </div>
    </ArtistPopover>
  )
}

const LoadUserAndRender = (props: UserNameAndBadgesWithIdProps) => {
  const currentUserId: number = useSelector(getUserId)!
  const { data: user } = useGetUserById({ id: props.userId, currentUserId })
  return <UserNameAndBadgesImpl {...props} user={user} />
}

function isIdProps(
  props: UserNameAndBadgesProps
): props is UserNameAndBadgesWithIdProps {
  return (props as UserNameAndBadgesWithIdProps).userId != null
}

export const UserNameAndBadges = (props: UserNameAndBadgesProps) => {
  return isIdProps(props) ? (
    <LoadUserAndRender {...props} />
  ) : (
    <UserNameAndBadgesImpl {...props} />
  )
}
