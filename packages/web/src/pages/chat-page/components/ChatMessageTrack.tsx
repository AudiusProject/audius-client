import { useCallback, useEffect, useState } from 'react'

import {
  useGetPlaylistByPermalink,
  useGetTrackByPermalink,
  getPathFromPlaylistUrl,
  getPathFromTrackUrl,
  isPlaylistUrl,
  isTrackUrl,
  Kind,
  Nullable,
  accountSelectors,
  Status,
  makeUid,
  Track
} from '@audius/common'
import { ChatMessage } from '@audius/sdk'
import { useSelector } from 'react-redux'

import MobileTrackTile from 'components/track/mobile/ConnectedTrackTile'
import { TrackTileSize } from 'components/track/types'
const { getUserId } = accountSelectors

export const useAudiusTrackOrPlaylist = (message: ChatMessage) => {
  const currentUserId = useSelector(getUserId)
  const [trackPermalink, setTrackPermalink] =
    useState<Nullable<string>>('/saliou_2/prem1')
  const [playlistPermalink, setPlaylistPermalink] = useState<Nullable<string>>(
    '/ray60/playlist/test-555'
  )
  const [kind, setKind] = useState<Kind>(Kind.EMPTY)

  const {
    data: track,
    status: trackStatus,
    errorMessage: trackError
  } = useGetTrackByPermalink({
    permalink: trackPermalink,
    currentUserId
  })
  // console.log('TRACK IS', track)

  const {
    data: playlist,
    status: playlistStatus,
    errorMessage: playlistError
  } = useGetPlaylistByPermalink({
    permalink: playlistPermalink,
    currentUserId
  })
  // console.log('PLAYLIST IS', playlist)

  useEffect(() => {
    if (isPlaylistUrl(message.message)) {
      const permalink = getPathFromPlaylistUrl(message.message)
      if (permalink) {
        setPlaylistPermalink(permalink)
        setKind(Kind.COLLECTIONS)
      }
    } else if (isTrackUrl(message.message)) {
      const permalink = getPathFromTrackUrl(message.message)
      if (permalink) {
        setTrackPermalink(permalink)
        setKind(Kind.TRACKS)
      }
    }
  }, [message])

  // console.log({
  //   msg: message.message, kind, playlist, playlistStatus, playlistError, track, trackStatus, trackError
  // })
  return {
    kind, playlist, playlistStatus, playlistError, track, trackStatus, trackError
  }
}

type ChatMessageTrackProps = {
  track: Track
  status: Status
  errorMessage: string | null | undefined
}

export const ChatMessageTrack = ({
  track,
  status,
  errorMessage
}: ChatMessageTrackProps) => {

  if (status === Status.ERROR) {
    return (
      // todo
      <div>error</div>
    )
  }
  // maybe add an abstraction layer that uses web track tile -> mobile track tile
  // get mobile track tile props
  // - uid
  // - index,
  // - size,
  // - ordered,
  // - isTrending
  // - showRankIcon
  return (
    // <div>waddup</div>
    <MobileTrackTile
      index={0}
      togglePlay={() => { }}
      uid={makeUid(Kind.TRACKS, track?.track_id)}
      isLoading={status === Status.LOADING || status === Status.IDLE}
      hasLoaded={() => { }}
      isTrending={false}
      showRankIcon={false}
      showArtistPick={false}
      isDM

    // title=''
    // id={1}
    // userId={1}
    // repostCount={0}
    // followeeReposts={[]}
    // followeeSaves={[]}
    // hasCurrentUserReposted={false}
    // hasCurrentUserSaved={false}
    // duration={0}
    // coverArtSizes={undefined}
    // isActive={false}
    // genre={"/Users/saliou/audius-client/packages/common/dist/utils/genres".ALL}
    // saveCount={0}
    // artistIsVerified={false}
    // isPlaying={false}
    // goToRoute={function (route: string): void {
    //   throw new Error('Function not implemented.');
    // } }
    />
  )
}
