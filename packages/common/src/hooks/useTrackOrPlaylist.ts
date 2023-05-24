import { useEffect, useState } from 'react'

import { ChatMessage } from '@audius/sdk'
import { useSelector } from 'react-redux'

import { Kind, ID } from 'models'
import { useGetTrackByPermalink, useGetPlaylistById } from 'src/api'
import { getUserId } from 'store/account/selectors'
import { Nullable } from 'utils/typeUtils'
import {
  getPathFromPlaylistUrl,
  getPathFromTrackUrl,
  hasPlaylistUrl,
  hasTrackUrl
} from 'utils/urlUtils'

export const useTrackOrPlaylist = (message: ChatMessage) => {
  const currentUserId = useSelector(getUserId)
  const [trackPermalink, setTrackPermalink] = useState<Nullable<string>>(null)
  const [playlistId, setPlaylistId] =
    useState<Nullable<ID>>(null)
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
    if (hasPlaylistUrl(message.message)) {
      const permalink = getPathFromPlaylistUrl(message.message)
      if (permalink) {
        const playlistNameWithId = permalink.split('/').slice(-1)[0]
        const playlistId = parseInt(playlistNameWithId.split('-').slice(-1)[0])
        if (playlistId) {
          setPlaylistId(playlistId)
          setKind(Kind.COLLECTIONS)
        }
      }
    } else if (hasTrackUrl(message.message)) {
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
