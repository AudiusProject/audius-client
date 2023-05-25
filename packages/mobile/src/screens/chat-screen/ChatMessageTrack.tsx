import { View } from "react-native"
import { Text } from 'app/components/core'
import { TrackTile } from 'app/components/lineup-tile'
import { ID, Kind, PlaybackSource, UID, accountSelectors, getPathFromTrackUrl, makeUid, useGetTrackByPermalink } from "@audius/common"
import { useSelector } from "react-redux"
import { useCallback, useMemo } from "react"
import { LineupTile } from "app/components/lineup-tile/LineupTile"

const { getUserId } = accountSelectors

type ChatMessageTrackProps = {
  link: string
  isAuthor: boolean
}

export const ChatMessageTrack = ({ link, isAuthor }: ChatMessageTrackProps) => {
  const currentUserId = useSelector(getUserId)
  const permalink = getPathFromTrackUrl(link)

  const { data: track, status } = useGetTrackByPermalink(
    {
      permalink,
      currentUserId
    },
    { disabled: !permalink }
  )
  const item = track ? {
    ...track,
    // todo: make sure good value is passed in here
    _cover_art_sizes: {}
  } : null
  const user = track ? {
    ...track.user,
    // todo: make sure good values are passed in here
    _profile_picture_sizes: {},
    _cover_photo_sizes: {}
  } : null

  const uid = useMemo(() => {
    return track ? makeUid(Kind.TRACKS, track.track_id) : ''
  }, [track])

  const onTogglePlay = useCallback((args: { uid: UID; id: ID; source: PlaybackSource }) => {
  //   if (!track) return
  //   if (isTrackPlaying) {
  //     dispatch(pause({}))
  //     recordAnalytics({
  //       name: Name.PLAYBACK_PAUSE,
  //       source: PlaybackSource.CHAT_TRACK
  //     })
  //   } else if (
  //     currentQueueItem.uid !== uid &&
  //     currentQueueItem.track &&
  //     currentQueueItem.uid === uid
  //   ) {
  //     dispatch(play({}))
  //     recordAnalytics({
  //       name: Name.PLAYBACK_PLAY,
  //       source: PlaybackSource.CHAT_TRACK
  //     })
  //   } else {
  //     dispatch(clear({}))
  //     dispatch(
  //       add({
  //         entries: [
  //           { id: track.track_id, uid, source: QueueSource.CHAT_TRACKS }
  //         ]
  //       })
  //     )
  //     dispatch(play({ uid }))
  //     recordAnalytics({
  //       name: Name.PLAYBACK_PLAY,
  //       source: PlaybackSource.CHAT_TRACK
  //     })
  //   }
  // }, [dispatch, recordAnalytics, track, isTrackPlaying, currentQueueItem, uid])
  }, [])

  return item && user ? (
    <View>
      <LineupTile
        item={item}
        user={user}
        isTrending={false}
        showArtistPick={false}
        showRankIcon={false}
        // togglePlay={onTogglePlay}
        uid={uid}
        isChat
      />
      <Text>track</Text>
    </View>
  ) : null
}
