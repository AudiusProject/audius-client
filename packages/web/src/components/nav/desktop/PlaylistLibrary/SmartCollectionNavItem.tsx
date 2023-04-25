import { useCallback, useState, MouseEvent } from 'react'

import {
  playlistUpdatesSelectors,
  Name,
  ID,
  cacheCollectionsActions,
  playlistLibraryActions,
  PlaylistLibraryID,
  PlaylistLibraryKind
} from '@audius/common'
import { useDispatch } from 'react-redux'

import { make, useRecord } from 'common/store/analytics/actions'
import { Draggable } from 'components/dragndrop'
import { open as openEditPlaylistModal } from 'store/application/ui/editPlaylistModal/slice'
import { DragDropKind, selectDraggingKind } from 'store/dragndrop/slice'
import { useSelector } from 'utils/reducer'
import { playlistPage } from 'utils/route'

import { LeftNavDroppable, LeftNavItem } from '../LeftNavLink'

import { EditNavItemButton } from './EditNavItemButton'
import styles from './PlaylistNavItem.module.css'
import { PlaylistUpdateDot } from './PlaylistUpdateDot'

const { selectPlaylistUpdateById } = playlistUpdatesSelectors
const { addTrackToPlaylist } = cacheCollectionsActions
const { reorder } = playlistLibraryActions

const messages = {
  editPlaylistLabel: 'Edit playlist'
}

const acceptedKinds: DragDropKind[] = [
  'track',
  'playlist',
  'library-playlist',
  'playlist-folder'
]

type PlaylistNavItemProps = {
  playlistId: number
  level: number
  className?: string
}

export const PlaylistNavItem = (props: PlaylistNavItemProps) => {
  const { playlistId, className, level } = props
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const dispatch = useDispatch()
  const record = useRecord()

  const playlistName = useSelector(
    (state) => state.account.collections[playlistId]?.name
  )
  const isOwnedByCurrentUser = useSelector(
    (state) =>
      state.account.collections[playlistId]?.user.id === state.account.userId
  )

  const playlistUrl = useSelector((state) => {
    const playlist = state.account.collections[playlistId]
    if (!playlist) return null
    const { name, user } = playlist
    const { handle } = user
    return playlistPage(handle, name, playlistId)
  })

  const playlistUpdate = useSelector((state) =>
    selectPlaylistUpdateById(state, playlistId)
  )

  const handleDrop = useCallback(
    (id: PlaylistLibraryID, kind: DragDropKind) => {
      if (kind === 'track') {
        dispatch(addTrackToPlaylist(id as ID, playlistId))
      } else {
        dispatch(
          reorder({
            draggingId: id,
            droppingId: playlistId,
            draggingKind: kind as PlaylistLibraryKind
          })
        )
      }
    },
    [dispatch, playlistId]
  )

  const handleDragEnter = useCallback(() => {
    setIsDraggingOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDraggingOver(false)
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
  }, [])

  const handleClickEdit = useCallback(
    (event: MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      dispatch(openEditPlaylistModal(playlistId))
      record(make(Name.PLAYLIST_OPEN_EDIT_FROM_LIBRARY, {}))
    },
    [dispatch, playlistId, record]
  )

  const draggingKind = useSelector(selectDraggingKind)

  const isDisabled = draggingKind === 'track' && !isOwnedByCurrentUser

  if (!playlistName || !playlistUrl) return null

  return (
    <LeftNavDroppable
      acceptedKinds={acceptedKinds}
      onDrop={handleDrop}
      disabled={isDisabled}
    >
      <Draggable
        id={playlistId}
        text={playlistName}
        link={playlistUrl}
        kind='library-playlist'
      >
        <LeftNavItem
          to={playlistUrl}
          className={className}
          disabled={isDisabled}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {playlistUpdate ? <PlaylistUpdateDot /> : null}
          <span className={level === 1 ? styles.playlistLevel1 : undefined}>
            {playlistName}
          </span>
          {isOwnedByCurrentUser && isHovering && !isDraggingOver ? (
            <EditNavItemButton
              aria-label={messages.editPlaylistLabel}
              onClick={handleClickEdit}
            />
          ) : null}
        </LeftNavItem>
      </Draggable>
    </LeftNavDroppable>
  )
}
