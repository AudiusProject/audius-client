import { useEffect, useState } from 'react'

import { ChatMessage } from '@audius/sdk'
import { useSelector } from 'react-redux'

import { Kind } from 'models'
import { useGetPlaylistById, useGetTrackByPermalink } from 'src/api'
import { getUserId } from 'store/account/selectors'
import { Nullable } from 'utils/typeUtils'
import {
  getPathFromPlaylistUrl,
  getPathFromTrackUrl,
  isPlaylistUrl,
  isTrackUrl
} from 'utils/urlUtils'

export const useTrackOrPlaylist = (message: ChatMessage) => {
  const currentUserId = useSelector(getUserId)
  const [trackPermalink, setTrackPermalink] = useState<Nullable<string>>(null)
  const [playlistId, setPlaylistId] =
    useState<Nullable<string>>(null)
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
  } = useGetPlaylistById({
    playlistId,
    currentUserId
  })

  useEffect(() => {
    if (isPlaylistUrl(message.message)) {
      const permalink = getPathFromPlaylistUrl(message.message)
      if (permalink) {
        const playlistNameWithId = permalink.split('/').slice(-1)[0]
        const playlistId = playlistNameWithId.split('-').slice(-1)[0]
        setPlaylistId(playlistId)
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
    kind,
    playlist,
    playlistStatus,
    playlistError,
    track,
    trackStatus,
    trackError
  }
}
