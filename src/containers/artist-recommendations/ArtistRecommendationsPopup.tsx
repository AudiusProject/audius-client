import React, { MutableRefObject, useCallback, useEffect, useMemo } from 'react'

import { Popup, PopupPosition } from '@audius/stems'
import { push } from 'connected-react-router'
import { useDispatch, useSelector } from 'react-redux'

import User from 'models/User'
import { ID } from 'models/common/Identifiers'
import { FollowSource } from 'services/analytics'
import { getUser } from 'store/cache/users/selectors'
import * as socialActions from 'store/social/users/actions'
import { AppState } from 'store/types'
import { profilePage } from 'utils/route'
import zIndex from 'utils/zIndex'

import { ArtistRecommendations } from './ArtistRecommendations'
import styles from './ArtistRecommendationsPopup.module.css'
import { makeGetRelatedArtists } from './store/selectors'
import { fetchRelatedArtists } from './store/slice'

type ArtistRecommendationsPopupProps = {
  anchorRef: MutableRefObject<HTMLElement>
  artistId: ID
  isVisible: boolean
  onClose: () => void
  onArtistNameClicked: (handle: string) => void
  onFollowAll: (userIds: ID[]) => void
  onUnfollowAll: (userIds: ID[]) => void
}

export const ArtistRecommendationsPopup = ({
  anchorRef,
  artistId,
  isVisible,
  onClose
}: ArtistRecommendationsPopupProps) => {
  // Get the artist
  const user = useSelector<AppState, User | null>(state =>
    getUser(state, { id: artistId })
  )
  if (!user) return null
  const { name } = user

  return (
    <Popup
      position={PopupPosition.BOTTOM_LEFT}
      anchorRef={anchorRef}
      isVisible={isVisible}
      zIndex={zIndex.FOLLOW_RECOMMENDATIONS_POPUP}
      onClose={onClose}
      className={styles.popup}
    >
      <ArtistRecommendations
        itemClassName={styles.popupItem}
        header={<h2 className={styles.headerTitle}>Suggested Artists</h2>}
        subheader={
          <p className={styles.popupItem}>
            Here are some accounts that vibe well with {name}
          </p>
        }
        artistId={artistId}
        onClose={onClose}
      />
    </Popup>
  )
}
