import { MouseEventHandler, useCallback, useMemo } from 'react'

import { useDispatch } from 'react-redux'

import { FollowSource } from 'common/models/Analytics'
import { User } from 'common/models/User'
import { FeatureFlags } from 'common/services/remote-config'
import { setNotificationSubscription } from 'common/store/pages/profile/actions'
import { followUser, unfollowUser } from 'common/store/social/users/actions'
import FollowButton from 'components/follow-button/FollowButton'
import Stats, { StatProps } from 'components/stats/Stats'
import { remoteConfigInstance } from 'services/remote-config/remote-config-instance'

import styles from './ArtistCard.module.css'
import { ArtistCardCover } from './ArtistCardCover'
import { ArtistSupporting } from './ArtistSupporting'
const { getFeatureEnabled } = remoteConfigInstance

type ArtistCardProps = {
  artist: User
  onNavigateAway: () => void
}

export const ArtistCard = (props: ArtistCardProps) => {
  const { artist, onNavigateAway } = props
  const {
    user_id,
    bio,
    is_creator,
    track_count,
    playlist_count,
    follower_count,
    followee_count,
    does_current_user_follow
  } = artist

  const dispatch = useDispatch()
  const isArtist = is_creator || track_count > 0
  const isTippingEnabled = getFeatureEnabled(FeatureFlags.TIPPING_ENABLED)

  const handleClick: MouseEventHandler = useCallback(event => {
    event.stopPropagation()
  }, [])

  const stats = useMemo((): StatProps[] => {
    if (isArtist) {
      return [
        {
          number: track_count,
          title: track_count === 1 ? 'track' : 'tracks',
          key: 'track'
        },
        {
          number: follower_count,
          title: follower_count === 1 ? 'follower' : 'followers',
          key: 'follower'
        },
        { number: followee_count, title: 'following', key: 'following' }
      ]
    }
    return [
      {
        number: playlist_count,
        title: playlist_count === 1 ? 'playlist' : 'playlists',
        key: 'playlist'
      },
      {
        number: follower_count,
        title: follower_count === 1 ? 'follower' : 'followers',
        key: 'follower'
      },
      { number: followee_count, title: 'following', key: 'following' }
    ]
  }, [isArtist, track_count, follower_count, followee_count, playlist_count])

  const handleFollow = useCallback(() => {
    dispatch(followUser(user_id, FollowSource.HOVER_TILE))
  }, [dispatch, user_id])

  const handleUnfollow = useCallback(() => {
    dispatch(unfollowUser(user_id, FollowSource.HOVER_TILE))
    dispatch(setNotificationSubscription(user_id, false, true))
  }, [dispatch, user_id])

  return (
    <div className={styles.popoverContainer} onClick={handleClick}>
      <div className={styles.artistCardContainer}>
        <ArtistCardCover
          artist={artist}
          isArtist={isArtist}
          onNavigateAway={onNavigateAway}
        />
        <div className={styles.artistStatsContainer}>
          <Stats
            userId={user_id}
            stats={stats}
            clickable={false}
            size='medium'
          />
        </div>
        <div className={styles.contentContainer}>
          <div>
            {isTippingEnabled ? (
              <ArtistSupporting
                artist={artist}
                onNavigateAway={onNavigateAway}
              />
            ) : null}
            <div className={styles.description}>{bio}</div>
            <FollowButton
              className={styles.followButton}
              following={does_current_user_follow}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
              stopPropagation
            />
          </div>
        </div>
      </div>
    </div>
  )
}
