import React from 'react'

import { ReactComponent as IconTip } from 'assets/img/iconTip.svg'
import { Supporting } from 'common/models/Tipping'
import { UserProfilePictureList } from 'components/notification/Notifications/UserProfilePictureList'

import styles from './ArtistCard.module.css'

const messages = {
  supporting: 'Supporting'
}

const MAX_TOP_SUPPORTING = 7

type ArtistSupportingProps = {
  supportingList: Supporting[]
  supportingCount: number
  handleClick: () => void
}
export const ArtistSupporting = ({
  supportingList,
  handleClick
}: ArtistSupportingProps) => {
  return supportingList.length > 0 ? (
    <div className={styles.supportingContainer} onClick={handleClick}>
      <div className={styles.supportingTitleContainer}>
        <IconTip className={styles.supportingIcon} />
        <span className={styles.supportingTitle}>{messages.supporting}</span>
      </div>
      <div className={styles.line} />
      <UserProfilePictureList
        limit={MAX_TOP_SUPPORTING}
        users={supportingList.map(s => s.receiver)}
        totalUserCount={supportingList.length}
        disableProfileClick
        disablePopover
      />
    </div>
  ) : null
}
