import { ID, cacheUsersSelectors } from '@audius/common'
import cn from 'classnames'

import { ArtistPopover } from 'components/artist/ArtistPopover'
import { Text } from 'components/typography'
import UserBadges from 'components/user-badges/UserBadges'
import { useSelector } from 'utils/reducer'
import { profilePage } from 'utils/route'

import { Link, LinkProps } from './Link'
import styles from './UserLink.module.css'

const { getUser } = cacheUsersSelectors

type UserLinkProps = Omit<LinkProps, 'to'> & {
  userId: ID
  textAs?: 'h2' | 'span'
  badgeSize?: number
  popover?: boolean
}

export const UserLink = (props: UserLinkProps) => {
  const {
    userId,
    textAs = 'span',
    badgeSize = 16,
    popover,
    className,
    ...other
  } = props

  const url = useSelector((state) => {
    const handle = getUser(state, { id: userId })?.handle
    return handle ? profilePage(handle) : ''
  })

  const handle = useSelector((state) => getUser(state, { id: userId })?.handle)
  const userName = useSelector((state) => getUser(state, { id: userId })?.name)

  const linkElement = (
    <Link to={url} className={cn(styles.root, className)} {...other}>
      <Text as={textAs} variant='inherit' className={styles.name}>
        {userName}
      </Text>
      <UserBadges
        badgeSize={badgeSize}
        userId={userId}
        className={styles.badge}
      />
    </Link>
  )

  return popover && handle ? (
    <ArtistPopover handle={handle}>{linkElement}</ArtistPopover>
  ) : (
    linkElement
  )
}
