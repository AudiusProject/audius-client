import { useCallback } from 'react'

import { playlistUpdatesSelectors } from '@audius/common'

import { useSelector } from 'utils/reducer'
import { playlistPage } from 'utils/route'

import { DroppableLeftNavItem } from '../LeftNavLink'

import styles from './PlaylistNavItem.module.css'
import { PlaylistUpdateDot } from './PlaylistUpdateDot'

const { selectPlaylistUpdateById } = playlistUpdatesSelectors

type PlaylistNavItemProps = {
  playlistId: number
  level: number
  className?: string
}

export const PlaylistNavItem = (props: PlaylistNavItemProps) => {
  const { playlistId, className, level } = props

  const playlistName = useSelector(
    (state) => state.account.collections[playlistId].name
  )
  const isOwnedByCurrentUser = useSelector(
    (state) =>
      state.account.collections[playlistId].user.id === state.account.userId
  )

  const playlistUrl = useSelector((state) => {
    const { name, user } = state.account.collections[playlistId]
    const { handle } = user
    return playlistPage(handle, name, playlistId)
  })

  const playlistUpdate = useSelector((state) =>
    selectPlaylistUpdateById(state, playlistId)
  )

  const handleDrop = useCallback((id, kind) => {
    console.log('dropped onto playlist', id, kind)
  }, [])

  return (
    <DroppableLeftNavItem
      to={playlistUrl}
      acceptedKinds={['track', 'playlist', 'playlist-folder']}
      onDrop={handleDrop}
      className={className}
      disabled={!isOwnedByCurrentUser}
    >
      {playlistUpdate ? <PlaylistUpdateDot /> : null}
      <span className={level === 1 ? styles.playlistLevel1 : undefined}>
        {playlistName}
      </span>
    </DroppableLeftNavItem>
  )
}
