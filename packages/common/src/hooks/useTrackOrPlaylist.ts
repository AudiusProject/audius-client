import { ChatMessage } from "@audius/sdk"
import { Kind } from "models"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useGetPlaylistByPermalink, useGetTrackByPermalink } from "src/api"
import { getUserId } from "store/account/selectors"
import { Nullable } from "utils/typeUtils"
import { getPathFromPlaylistUrl, getPathFromTrackUrl, isPlaylistUrl, isTrackUrl } from "utils/urlUtils"

export const useTrackOrPlaylist = (message: ChatMessage) => {
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

  const {
    data: playlist,
    status: playlistStatus,
    errorMessage: playlistError
  } = useGetPlaylistByPermalink({
    permalink: playlistPermalink,
    currentUserId
  })

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

  return {
    kind, playlist, playlistStatus, playlistError, track, trackStatus, trackError
  }
}
