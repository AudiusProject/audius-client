import React, { MouseEventHandler, useCallback, useMemo } from 'react'

import { User } from 'common/models/User'
import FollowButton from 'components/follow-button/FollowButton'
import Stats, { StatProps } from 'components/stats/Stats'

import styles from './ArtistCard.module.css'
import { ArtistCardCover } from './ArtistCardCover'

type ArtistCardProps = {
  artist: User
  onNameClick: () => void
  onFollow: () => void
  onUnfollow: () => void
}

export const ArtistCard = ({
  artist,
  onNameClick,
  onFollow,
  onUnfollow
}: ArtistCardProps) => {
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

  const isArtist = is_creator || track_count > 0

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

  return (
    <div className={styles.popoverContainer} onClick={handleClick}>
      <div className={styles.artistCardContainer}>
        <ArtistCardCover
          artist={artist}
          isArtist={isArtist}
          onNameClick={onNameClick}
        />
        <div className={styles.artistStatsContainer}>
          <Stats
            userId={user_id}
            stats={stats}
            clickable={false}
            size='medium'
          />
        </div>
        <div className={styles.descriptionContainer}>
          <div>
            <div className={styles.description}>{bio}</div>
            <FollowButton
              className={styles.followButton}
              following={does_current_user_follow}
              onFollow={onFollow}
              onUnfollow={onUnfollow}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
