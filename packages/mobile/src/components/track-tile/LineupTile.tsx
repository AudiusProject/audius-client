import { useState, useEffect, useRef, useCallback } from 'react'

import { Collection } from 'audius-client/src/common/models/Collection'
import { Track } from 'audius-client/src/common/models/Track'
import { User } from 'audius-client/src/common/models/User'
import { getUserId } from 'audius-client/src/common/store/account/selectors'
import { Animated, Easing, GestureResponderEvent } from 'react-native'
import { useSelector } from 'react-redux'

import { LineupTileProps } from 'app/components/track-tile/types'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { getPlaying, getPlayingUid } from 'app/store/audio/selectors'

import { TrackBannerIcon, TrackBannerIconType } from './TrackBannerIcon'
import { TrackTileActionButtons } from './TrackTileActionButtons'
import { TrackTileCoSign } from './TrackTileCoSign'
import { TrackTileMetadata } from './TrackTileMetadata'
import { TrackTileRoot } from './TrackTileRoot'
import { TrackTileStats } from './TrackTileStats'
import { TrackTileTopRight } from './TrackTileTopRight'

export const LineupTile = ({
  children,
  coSign,
  duration,
  hidePlays,
  hideShare,
  index,
  isTrending,
  isUnlisted,
  onLoad,
  onPressTitle,
  playCount,
  showArtistPick,
  showRankIcon,
  togglePlay,
  title,
  track,
  uid,
  user
}: LineupTileProps & { track: Track | Collection; user: User }) => {
  const {
    _cover_art_sizes,
    has_current_user_reposted,
    has_current_user_saved,
    repost_count,
    save_count,
    track_id
  } = track
  const { _artist_pick, name, user_id } = user

  const playingUid = useSelector(getPlayingUid)
  const isPlaying = useSelector(getPlaying)
  const currentUserId = useSelectorWeb(getUserId)

  const [artworkLoaded, setArtworkLoaded] = useState(false)

  const opacity = useRef(new Animated.Value(0)).current

  const isOwner = user_id === currentUserId
  const isLoaded = artworkLoaded
  const fadeIn = { opacity }

  const handlePress = useCallback(() => togglePlay(uid, track_id), [
    togglePlay,
    uid,
    track_id
  ])

  const onPressReposts = (e: GestureResponderEvent) => {
    // navigate to reposts page
    // goToRoute(REPOSTING_USERS_ROUTE)
  }

  useEffect(() => {
    if (isLoaded) {
      onLoad?.(index)
      Animated.timing(opacity, {
        toValue: 1,
        easing: Easing.ease,
        useNativeDriver: true
      }).start()
    }
  }, [onLoad, isLoaded, index, opacity])

  return (
    <TrackTileRoot onPress={handlePress}>
      {showArtistPick && _artist_pick === track_id && (
        <TrackBannerIcon type={TrackBannerIconType.STAR} />
      )}
      {isUnlisted && <TrackBannerIcon type={TrackBannerIconType.HIDDEN} />}
      <Animated.View style={fadeIn}>
        <TrackTileTopRight
          duration={duration}
          isArtistPick={_artist_pick === track_id}
          isUnlisted={isUnlisted}
          showArtistPick={showArtistPick}
        />
        <TrackTileMetadata
          artistName={name}
          coSign={coSign}
          coverArtSizes={_cover_art_sizes}
          id={track_id}
          onPressTitle={onPressTitle}
          isPlaying={uid === playingUid && isPlaying}
          setArtworkLoaded={setArtworkLoaded}
          title={title}
          user={user}
        />
        {coSign && <TrackTileCoSign coSign={coSign} />}
        <TrackTileStats
          trackId={track_id}
          hidePlays={hidePlays}
          index={index}
          isTrending={isTrending}
          isUnlisted={isUnlisted}
          playCount={playCount}
          onPressReposts={onPressReposts}
          repostCount={repost_count}
          saveCount={save_count}
          showRankIcon={showRankIcon}
        />
      </Animated.View>
      {children}
      <TrackTileActionButtons
        hasReposted={has_current_user_reposted}
        hasSaved={has_current_user_saved}
        isOwner={isOwner}
        isShareHidden={hideShare}
        isUnlisted={isUnlisted}
        trackId={track_id}
      />
    </TrackTileRoot>
  )
}
