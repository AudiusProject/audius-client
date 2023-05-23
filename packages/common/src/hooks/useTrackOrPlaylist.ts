import { useEffect, useState } from 'react'

import { ChatMessage } from '@audius/sdk'
import { useSelector } from 'react-redux'

import { Kind, ID } from 'models'
// import { Kind, ID, Status } from 'models'
import { useGetTrackByPermalink, useGetPlaylistById } from 'src/api'
import { getUserId } from 'store/account/selectors'
// import { chatActions } from 'store/pages/chat'
import { Nullable } from 'utils/typeUtils'
import {
  getPathFromPlaylistUrl,
  getPathFromTrackUrl,
  hasPlaylistUrl,
  hasTrackUrl
} from 'utils/urlUtils'
// import { useDispatch } from 'react-redux'
// import { getCollection } from 'store/cache/collections/selectors'
// import { CommonState } from 'store/index'

// const { fetchCollection } = chatActions

export const useTrackOrPlaylist = (message: ChatMessage) => {
  // const dispatch = useDispatch()
  const currentUserId = useSelector(getUserId)
  const [trackPermalink, setTrackPermalink] = useState<Nullable<string>>(null)
  const [playlistId, setPlaylistId] =
    useState<Nullable<ID>>(null)
  // Given we need playlist id to fetch the playlist (for now, until the playlist by migration work is complete),
  // we add the below states to handle scenarios where the message is an audius-playlist-url-like but there is
  // no playlist id in the url.
  // const [playlistStatus, setPlaylistStatus] = useState<Status>(Status.LOADING)
  // const [playlistError, setPlaylistError] = useState<Nullable<string>>(null)
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
        //   dispatch(fetchCollection({ id: playlistId }))
        // } else {
        //   setPlaylistStatus(Status.ERROR)
        //   setPlaylistError('No playlist id')
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
