import { useCallback, useEffect } from 'react'

import {
  User,
  profilePageSelectors,
  MAX_PROFILE_RELATED_ARTISTS,
  CommonState,
  artistRecommendationsUISelectors as relatedArtistSelectors,
  artistRecommendationsUIActions as relatedArtistsActions
} from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as IconUserGroup } from 'assets/img/iconUserGroup.svg'
import { ProfilePageNavSectionTitle } from 'components/profile-page-nav-section-title/ProfilePageNavSectionTitle'
import { ProfilePictureListTile } from 'components/profile-picture-list-tile/ProfilePictureListTile'
import {
  setUsers,
  setVisibility
} from 'store/application/ui/userListModal/slice'
import {
  UserListEntityType,
  UserListType
} from 'store/application/ui/userListModal/types'

import styles from './RelatedArtists.module.css'
const { getRelatedArtists } = relatedArtistSelectors
const { fetchRelatedArtists } = relatedArtistsActions
const { getProfileUser } = profilePageSelectors

const messages = {
  relatedArtists: 'Related Artists'
}

export const RelatedArtists = () => {
  const dispatch = useDispatch()
  const profile = useSelector(getProfileUser)

  const artistId = profile?.user_id

  const suggestedArtists = useSelector<CommonState, User[] | null>((state) =>
    artistId ? getRelatedArtists(state, { id: artistId }) : null
  )

  // Start fetching the related artists
  useEffect(() => {
    if (!artistId) return
    dispatch(
      fetchRelatedArtists({
        userId: artistId
      })
    )
  }, [dispatch, artistId])

  const handleClick = useCallback(() => {
    if (profile) {
      dispatch(
        setUsers({
          userListType: UserListType.RELATED_ARTISTS,
          entityType: UserListEntityType.USER,
          id: profile.user_id
        })
      )
      dispatch(setVisibility(true))
    }
  }, [profile, dispatch])

  if (!profile || !suggestedArtists || suggestedArtists.length === 0) {
    return null
  }

  return (
    <div>
      <ProfilePageNavSectionTitle
        title={messages.relatedArtists}
        titleIcon={<IconUserGroup className={styles.userGroupIcon} />}
      />
      <ProfilePictureListTile
        onClick={handleClick}
        users={suggestedArtists}
        totalUserCount={suggestedArtists.length}
        limit={MAX_PROFILE_RELATED_ARTISTS}
        disableProfileClick
      />
    </div>
  )
}
