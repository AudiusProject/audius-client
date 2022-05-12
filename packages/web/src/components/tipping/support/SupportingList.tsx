import React, { useCallback } from 'react'

import { IconArrow } from '@audius/stems'
import { useDispatch } from 'react-redux'

import { ReactComponent as IconTip } from 'assets/img/iconTip.svg'
import { useSelector } from 'common/hooks/useSelector'
import { getProfileUser } from 'common/store/pages/profile/selectors'
import { getSupporting } from 'common/store/tipping/selectors'
import {
  setUsers,
  setVisibility
} from 'store/application/ui/userListModal/slice'
import {
  UserListEntityType,
  UserListType
} from 'store/application/ui/userListModal/types'

import styles from './Support.module.css'
import { SupportingTile } from './SupportingTile'

const MAX_SUPPORTING_TILES = 3

const messages = {
  supporting: 'Supporting',
  seeMorePrefix: 'See ',
  seeMoreSuffix: ' More'
}

export const SupportingList = () => {
  const dispatch = useDispatch()
  const profile = useSelector(getProfileUser)
  const supportingMap = useSelector(getSupporting)
  const supportingForProfile = profile
    ? supportingMap[profile.user_id] ?? {}
    : {}
  const rankedSupportingList = Object.keys(supportingForProfile)
    .sort((k1, k2) => {
      const id1 = parseInt(k1)
      const id2 = parseInt(k2)
      return supportingForProfile[id2].amount - supportingForProfile[id1].amount
    })
    .map(k => supportingForProfile[parseInt(k)])

  const handleClick = useCallback(() => {
    if (profile) {
      dispatch(
        setUsers({
          userListType: UserListType.SUPPORTING,
          entityType: UserListEntityType.USER,
          id: profile.user_id
        })
      )
      dispatch(setVisibility(true))
    }
  }, [profile, dispatch])

  return profile && rankedSupportingList.length ? (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <IconTip className={styles.tipIcon} />
        <span className={styles.titleText}>{messages.supporting}</span>
        <span className={styles.line} />
      </div>
      {rankedSupportingList
        .slice(0, MAX_SUPPORTING_TILES)
        .map((supporting, index) => (
          <div key={`supporting-${index}`} className={styles.tile}>
            <SupportingTile supporting={supporting} />
          </div>
        ))}
      {profile.supporting_count > MAX_SUPPORTING_TILES && (
        <div className={styles.seeMore} onClick={handleClick}>
          <span>
            {messages.seeMorePrefix}+
            {`${profile.supporting_count - MAX_SUPPORTING_TILES}`}
            {messages.seeMoreSuffix}
          </span>
          <IconArrow className={styles.arrowIcon} />
        </div>
      )}
    </div>
  ) : null
}
