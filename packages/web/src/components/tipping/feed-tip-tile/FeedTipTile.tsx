import React, { useCallback, useEffect, useState } from 'react'

import { Button } from '@audius/stems'
import { push as pushRoute } from 'connected-react-router'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as IconClose } from 'assets/img/iconClose.svg'
import { ReactComponent as IconTip } from 'assets/img/iconTip.svg'
import { User } from 'common/models/User'
import { FeatureFlags } from 'common/services/remote-config'
import { getUsers } from 'common/store/cache/users/selectors'
import {
  getShowTip,
  getStorageCache,
  getTipToDisplay
} from 'common/store/tipping/selectors'
import {
  beginTip,
  fetchRecentTips,
  hideTip,
  setMainUser
} from 'common/store/tipping/slice'
import { ArtistPopover } from 'components/artist/ArtistPopover'
import { ProfilePicture } from 'components/notification/Notification/components/ProfilePicture'
import Skeleton from 'components/skeleton/Skeleton'
import UserBadges from 'components/user-badges/UserBadges'
import { remoteConfigInstance } from 'services/remote-config/remote-config-instance'
import {
  setUsers,
  setVisibility
} from 'store/application/ui/userListModal/slice'
import {
  UserListEntityType,
  UserListType
} from 'store/application/ui/userListModal/types'
import {
  dismissRecentTip,
  getMinSlotForRecentTips,
  getRecentTipsStorage,
  updateTipsStorage
} from 'store/tipping/storageUtils'
import { AppState } from 'store/types'
import { NUM_FEED_TIPPERS_DISPLAYED } from 'utils/constants'

import styles from './FeedTipTile.module.css'

const { getFeatureEnabled } = remoteConfigInstance

const messages = {
  wasTippedBy: 'Was Tipped By',
  andOthers: (num: number) => `& ${num} ${num > 1 ? 'others' : 'other'}`,
  sendTipToPrefix: 'SEND TIP TO '
}

const SkeletonTile = () => (
  <div className={styles.container}>
    <div className={styles.skeletonContainer}>
      <Skeleton className={styles.skeleton} width='10%' />
      <Skeleton className={styles.skeleton} width='20%' />
      <Skeleton className={styles.skeleton} width='60%' />
    </div>
    <Skeleton className={styles.skeleton} width='30%' />
  </div>
)

const WasTippedBy = () => (
  <div className={styles.wasTippedByContainer}>
    <IconTip className={styles.wasTippedByIcon} />
    <span className={styles.wasTippedByText}>{messages.wasTippedBy}</span>
  </div>
)

type TippersProps = {
  tippers: User[]
  receiver: User
}

const Tippers = ({ tippers, receiver }: TippersProps) => {
  const dispatch = useDispatch()

  const handleClick = useCallback(() => {
    dispatch(
      setUsers({
        userListType: UserListType.SUPPORTER,
        entityType: UserListEntityType.USER,
        id: receiver.user_id
      })
    )
    dispatch(setVisibility(true))
  }, [dispatch, receiver])

  return (
    <div className={styles.tippers} onClick={handleClick}>
      {tippers.slice(0, NUM_FEED_TIPPERS_DISPLAYED).map((tipper, index) => (
        <div key={`tipper-${tipper.user_id}`} className={styles.tipperName}>
          <span>{tipper.name}</span>
          <UserBadges
            userId={tipper.user_id}
            className={styles.badge}
            badgeSize={12}
            inline
          />
          {index < tippers.length - 1 &&
          index < NUM_FEED_TIPPERS_DISPLAYED - 1 ? (
            <div className={styles.tipperSeparator}>,</div>
          ) : null}
        </div>
      ))}
      {receiver.supporter_count > NUM_FEED_TIPPERS_DISPLAYED ? (
        <div className={styles.andOthers}>
          {messages.andOthers(
            receiver.supporter_count -
              Math.min(tippers.length, NUM_FEED_TIPPERS_DISPLAYED)
          )}
        </div>
      ) : null}
    </div>
  )
}

type SendTipToButtonProps = {
  user: User
}

const SendTipToButton = ({ user }: SendTipToButtonProps) => {
  const dispatch = useDispatch()

  const handleClick = useCallback(() => {
    dispatch(beginTip({ user }))
  }, [dispatch, user])

  return (
    <div>
      <Button
        className={styles.sendTipButton}
        // todo: move to stems or see if button design
        // already exists elsewhere
        text={
          <div className={styles.sendTipButtonText}>
            {messages.sendTipToPrefix}
            <span className={styles.sendTipName}>{user.name}</span>
            <UserBadges
              userId={user.user_id}
              className={styles.badge}
              badgeSize={12}
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
    dispatch(hideTip())
  }, [dispatch])

  return (
    <div className={styles.dismissButton} onClick={handleClick}>
      <IconClose className={styles.dismissIcon} />
    </div>
  )
}

export const FeedTipTile = () => {
  const isTippingEnabled = getFeatureEnabled(FeatureFlags.TIPPING_ENABLED)

  const dispatch = useDispatch()
  const showTip = useSelector(getShowTip)
  const storage = useSelector(getStorageCache)
  const tipToDisplay = useSelector(getTipToDisplay)
  const tipperIds = tipToDisplay
    ? [
        tipToDisplay.sender_id,
        tipToDisplay.receiver_id,
        ...tipToDisplay.followee_supporter_ids
      ]
    : []
  const usersMap = useSelector<AppState, { [id: number]: User }>(state =>
    getUsers(state, { ids: tipToDisplay ? tipperIds : [] })
  )
  const [hasSetMainUser, setHasSetMainUser] = useState(false)

  useEffect(() => {
    if (
      isTippingEnabled &&
      !hasSetMainUser &&
      tipToDisplay &&
      usersMap[tipToDisplay.receiver_id]
    ) {
      dispatch(setMainUser({ user: usersMap[tipToDisplay.receiver_id] }))
      setHasSetMainUser(true)
    }
  }, [isTippingEnabled, hasSetMainUser, tipToDisplay, usersMap, dispatch])

  useEffect(() => {
    const minSlot = getMinSlotForRecentTips()
    const storage = getRecentTipsStorage()
    fetchRecentTips({ minSlot, storage })
  }, [dispatch])

  useEffect(() => {
    if (storage) {
      updateTipsStorage(storage)
    }
  }, [storage])

  const handleClick = useCallback(() => {
    if (tipToDisplay) {
      dispatch(pushRoute(`/${usersMap[tipToDisplay.receiver_id].handle}`))
    }
  }, [dispatch, usersMap, tipToDisplay])

  if (!isTippingEnabled || !showTip) {
    return null
  }

  return !tipToDisplay || Object.keys(usersMap).length !== tipperIds.length ? (
    <SkeletonTile />
  ) : (
    <div className={styles.container}>
      <div className={styles.usersContainer}>
        <ProfilePicture
          key={tipToDisplay.receiver_id}
          className={styles.profilePicture}
          user={usersMap[tipToDisplay.receiver_id]}
        />
        <ArtistPopover
          handle={usersMap[tipToDisplay.receiver_id].handle}
          component='div'
        >
          <div className={styles.name} onClick={handleClick}>
            <span>{usersMap[tipToDisplay.receiver_id].name}</span>
            <UserBadges
              userId={tipToDisplay.receiver_id}
              className={styles.badge}
              badgeSize={12}
              inline
            />
          </div>
        </ArtistPopover>
        <WasTippedBy />
        <Tippers
          tippers={[
            tipToDisplay.sender_id,
            ...tipToDisplay.followee_supporter_ids
          ]
            .map(id => usersMap[id])
            .filter((user): user is User => !!user)}
          receiver={usersMap[tipToDisplay.receiver_id]}
        />
      </div>
      <div className={styles.buttons}>
        <SendTipToButton user={usersMap[tipToDisplay.receiver_id]} />
        <DismissTipButton />
      </div>
    </div>
  )
}
