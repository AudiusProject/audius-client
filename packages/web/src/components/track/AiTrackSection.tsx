import { useCallback, useEffect } from 'react'

import {
  ID,
  User,
  cacheUsersSelectors,
  cacheUsersActions
} from '@audius/common'
import cn from 'classnames'
import { push as pushRoute } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import { ReactComponent as IconRobot } from 'assets/img/robot.svg'
import { useSelector } from 'common/hooks/useSelector'
import { ArtistPopover } from 'components/artist/ArtistPopover'
import UserBadges from 'components/user-badges/UserBadges'
import { emptyStringGuard } from 'pages/track-page/utils'
import { profilePage } from 'utils/route'

import styles from './AiTrackSection.module.css'
const { getUser } = cacheUsersSelectors
const { fetchUsers } = cacheUsersActions

const AI_TRACK_LEARN_MORE = '' // TODO(AI)

const messages = {
  title: 'Generated With AI',
  description: 'This song was made by an AI that has been trained to imitate',
  learnMore: 'Learn More'
}

type AiTrackSectionProps = {
  className: string
  attributedUserId: ID
}

export const AiTrackSection = ({
  attributedUserId,
  className
}: AiTrackSectionProps) => {
  const dispatch = useDispatch()
  const user = useSelector((state) => getUser(state, { id: attributedUserId }))

  useEffect(() => {
    if (!user) {
      dispatch(fetchUsers({ userIds: [attributedUserId] }))
    }
  }, [dispatch, user, attributedUserId])

  const renderArtist = useCallback(
    (entity: User) => (
      <ArtistPopover handle={entity.handle} mouseEnterDelay={0.1}>
        <h2
          className={styles.attributedUser}
          onClick={() =>
            dispatch(pushRoute(profilePage(emptyStringGuard(entity.handle))))
          }
        >
          {entity.name}
          <UserBadges
            userId={entity.user_id}
            className={styles.badgeIcon}
            badgeSize={14}
            useSVGTiers
          />
        </h2>
      </ArtistPopover>
    ),
    [dispatch]
  )
  const handleClickLearnMore = useCallback(() => {
    window.open(AI_TRACK_LEARN_MORE, '_blank')
  }, [])

  return (
    <div className={cn(className, styles.root)}>
      <div className={styles.title}>
        <IconRobot className={styles.iconRobot} />
        {messages.title}
      </div>
      <div className={styles.description}>
        {messages.description}
        {user ? renderArtist(user) : null}
      </div>
      <div className={styles.link} onClick={handleClickLearnMore}>
        {messages.learnMore}
      </div>
    </div>
  )
}