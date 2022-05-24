import React, { useCallback, useState } from 'react'

import { ReactComponent as IconTip } from 'assets/img/iconTip.svg'
import { User } from 'common/models/User'
import { getAccountUser } from 'common/store/account/selectors'
import { ProfilePicture } from 'components/notification/Notification/components/ProfilePicture'
import UserBadges from 'components/user-badges/UserBadges'
import { NUM_FEED_TIPPERS_DISPLAYED } from 'utils/constants'

import styles from './FeedTipTile.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { beginTip, fetchRecentTips, hideRecentTip } from 'common/store/tipping/slice'
import { getRecentTip } from 'common/store/tipping/selectors'
import { getUsers } from 'common/store/cache/users/selectors'
import { AppState } from 'store/types'
import { Button, ButtonType } from '@audius/stems'
import cn from 'classnames'
import { dismissRecentTip } from 'store/tipping/utils'
import { ReactComponent as IconClose } from 'assets/img/iconRemove.svg'

const messages = {
  wasTippedBy: 'Was Tipped By',
  andOthers: (num: number) => `& ${num} ${num > 1 ? 'others' : 'other'}`,
  sendTipToPrefix: 'SEND TIP TO '
}

const WasTippedBy = () => (
  <div className={styles.wasTippedByContainer}>
    <IconTip className={styles.wasTippedByIcon} />
    <span className={styles.wasTippedByText}>{messages.wasTippedBy}</span>
  </div>
)

type TippersProps = {
  tippers: User[]
}
const Tippers = ({ tippers }: TippersProps) => (
  <div className={styles.tippers}>
    {tippers.slice(0, NUM_FEED_TIPPERS_DISPLAYED).map((tipper, index) => (
      <div key={`tipper-${tipper.user_id}`} className={styles.tipperName}>
        <span>{tipper.name}</span>
        <UserBadges
          userId={tipper.user_id}
          className={styles.badge}
          badgeSize={10}
          inline
        />
        {index < tippers.length - 1 &&
          index < NUM_FEED_TIPPERS_DISPLAYED - 1 ? (
          <div className={styles.tipperSeparator}>,</div>
        ) : null}
      </div>
    ))}
    {tippers.length > NUM_FEED_TIPPERS_DISPLAYED ? (
      <div className={styles.andOthers}>
        {messages.andOthers(tippers.length - NUM_FEED_TIPPERS_DISPLAYED)}
      </div>
    ) : null}
  </div>
)

type SendTipToButtonProps = {
  user: User
}
const SendTipToButton = ({ user }: SendTipToButtonProps) => {
  const dispatch = useDispatch()
 
  const handleClick = useCallback(() => {
    dispatch(beginTip({ user }))
  }, [])

  return (
    <div>
      <Button
        className={styles.sendTipButton}
        // todo: update button type or see if button design
        // already exists elsewhere
        text={
          <div className={styles.sendTipButtonText}>
            {messages.sendTipToPrefix}
            <span className={styles.sendTipName}>{user.name}</span>
            <UserBadges
              userId={user.user_id}
              className={styles.badge}
              badgeSize={10}
              inline
            />
          </div>
        }
        onClick={handleClick}
      />
    </div>
  )
}

const DismissTipButton = () => {
  const dispatch = useDispatch()

  const handleClick = useCallback(() => {
    dismissRecentTip()
    dispatch(hideRecentTip())
  }, [])

  return (
    <div className={styles.dismissButton} onClick={handleClick}>
      <IconClose className={styles.dismissIcon} />
    </div>
  )
}

export const FeedTipTile = () => {
  const dispatch = useDispatch()
  const recentTip = useSelector(getRecentTip)
  const tipperIds = recentTip
    ? [recentTip.sender_id, recentTip.receiver_id, ...recentTip.followee_supporter_ids]
    : []
  const usersMap = useSelector<AppState, { [id: number]: User }>(state =>
    getUsers(state, { ids: recentTip ? tipperIds : [] })
  )

  useEffect(() => {
    dispatch(fetchRecentTips())
  }, [dispatch])

  return recentTip && Object.keys(usersMap).length === tipperIds.length ? (
    <div className={styles.container}>
      <div className={styles.usersContainer}>
        <ProfilePicture
          key={recentTip.receiver_id}
          className={styles.profilePicture}
          user={usersMap[recentTip.receiver_id]}
          disableClick
          disablePopover
        />
        <div className={styles.name}>
          <span>{usersMap[recentTip.receiver_id].name}</span>
          <UserBadges
            userId={recentTip.receiver_id}
            className={styles.badge}
            badgeSize={10}
            inline
          />
        </div>
        <WasTippedBy />
        <Tippers
          tippers={[recentTip.sender_id, ...recentTip.followee_supporter_ids]
            .map(id => usersMap[id])
            .filter((user): user is User => !!user)}
        />
      </div>
      <div className={styles.buttons}>
        <SendTipToButton user={usersMap[recentTip.receiver_id]} />
        <DismissTipButton />
      </div>
    </div>
  ) : null
}
