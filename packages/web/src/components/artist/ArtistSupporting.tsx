import React, { useCallback, useEffect } from 'react'

import { useDispatch } from 'react-redux'

import { ReactComponent as IconTip } from 'assets/img/iconTip.svg'
import { useSelector } from 'common/hooks/useSelector'
import { ID } from 'common/models/Identifiers'
import { User } from 'common/models/User'
import { getUsers } from 'common/store/cache/users/selectors'
import { getSupporting } from 'common/store/tipping/selectors'
import { fetchSupportingForUser } from 'common/store/tipping/slice'
import { stringWeiToBN } from 'common/utils/wallet'
import { UserProfilePictureList } from 'components/notification/Notification/components/UserProfilePictureList'
import {
  setUsers,
  setVisibility
} from 'store/application/ui/userListModal/slice'
import {
  UserListEntityType,
  UserListType
} from 'store/application/ui/userListModal/types'
import { MAX_ARTIST_HOVER_TOP_SUPPORTING } from 'utils/constants'

import styles from './ArtistSupporting.module.css'

const messages = {
  supporting: 'Supporting'
}

type ArtistSupportingProps = {
  artist: User
}
export const ArtistSupporting = (props: ArtistSupportingProps) => {
  const { artist } = props
  const { user_id, supporting_count } = artist
  const dispatch = useDispatch()

  const supportingMap = useSelector(getSupporting)
  const supportingForArtist = supportingMap[user_id] ?? {}
  const supportingForArtistIds = (Object.keys(
    supportingForArtist
  ) as unknown) as ID[]
  const rankedSupportingList = supportingForArtistIds
    .sort((k1, k2) => {
      const amount1BN = stringWeiToBN(supportingForArtist[k1].amount)
      const amount2BN = stringWeiToBN(supportingForArtist[k2].amount)
      return amount1BN.gte(amount2BN) ? -1 : 1
    })
    .map(k => supportingForArtist[k])

  const rankedSupporting = useSelector(state => {
    const usersMap = getUsers(state, {
      ids: rankedSupportingList.map(supporting => supporting.receiver_id)
    })
    return rankedSupportingList
      .sort((s1, s2) => s1.rank - s2.rank)
      .map(s => usersMap[s.receiver_id])
      .filter(Boolean)
  })

  /**
   * It's possible that we don't have the data for which artists
   * this artist is supporting. Thus, we fetch in this case.
   */
  useEffect(() => {
    if (supportingForArtistIds.length === 0) {
      dispatch(fetchSupportingForUser({ userId: user_id }))
    }
  }, [dispatch, supportingForArtistIds, user_id])

  const handleClick = useCallback(() => {
    dispatch(
      setUsers({
        userListType: UserListType.SUPPORTING,
        entityType: UserListEntityType.USER,
        id: user_id
      })
    )
    dispatch(setVisibility(true))
  }, [dispatch, user_id])

  return rankedSupportingList.length > 0 ? (
    <div className={styles.supportingContainer} onClick={handleClick}>
      <div className={styles.supportingTitleContainer}>
        <IconTip className={styles.supportingIcon} />
        <span className={styles.supportingTitle}>{messages.supporting}</span>
      </div>
      <div className={styles.line} />
      <UserProfilePictureList
        limit={MAX_ARTIST_HOVER_TOP_SUPPORTING}
        users={rankedSupporting}
        totalUserCount={supporting_count}
        disableProfileClick
        disablePopover
      />
    </div>
  ) : null
}
