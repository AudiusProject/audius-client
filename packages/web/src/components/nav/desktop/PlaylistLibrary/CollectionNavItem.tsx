import { useCallback, useState } from 'react'

import {
  Name,
  ID,
  cacheCollectionsActions,
  cacheTracksSelectors,
  cacheCollectionsSelectors,
  playlistLibraryActions,
  PlaylistLibraryKind,
  PlaylistLibraryID,
  shareModalUIActions,
  ShareSource
} from '@audius/common'
import { PopupMenuItem } from '@audius/stems'
import cn from 'classnames'
import { useDispatch } from 'react-redux'
import { useToggle } from 'react-use'

import { make, useRecord } from 'common/store/analytics/actions'
import { Draggable } from 'components/dragndrop'
import { open as openEditPlaylistModal } from 'store/application/ui/editPlaylistModal/slice'
import {
  DragDropKind,
  selectDraggingKind,
  selectDraggingId
} from 'store/dragndrop/slice'
import { useSelector } from 'utils/reducer'
import { BASE_URL } from 'utils/route'

import { LeftNavDroppable, LeftNavLink } from '../LeftNavLink'

import styles from './CollectionNavItem.module.css'
import { DeleteCollectionConfirmationModal } from './DeleteCollectionConfirmationModal'
import { NavItemKebabButton } from './NavItemKebabButton'
import { PlaylistUpdateDot } from './PlaylistUpdateDot'

const { getTrack } = cacheTracksSelectors
const { addTrackToPlaylist } = cacheCollectionsActions
const { getCollection } = cacheCollectionsSelectors
const { reorder } = playlistLibraryActions
const { requestOpen } = shareModalUIActions

const messages = {
  editPlaylistLabel: 'Edit playlist',
  edit: 'Edit',
  share: 'Share',
  delete: 'Delete'
}

const acceptedKinds: DragDropKind[] = [
  'track',
  'playlist',
  'library-playlist',
  'playlist-folder'
]

type CollectionNavItemProps = {
  id: PlaylistLibraryID
  name: string
  url: string
  isOwned: boolean
  level: number
  hasUpdate?: boolean
  onClick?: () => void
}

export const CollectionNavItem = (props: CollectionNavItemProps) => {
  const { id, name, url, isOwned, level, hasUpdate, onClick } = props
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const dispatch = useDispatch()
  const record = useRecord()
  const [isDeleteConfirmationOpen, toggleDeleteConfirmationOpen] =
    useToggle(false)

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

  const handleEdit = useCallback(() => {
    if (typeof id === 'number') {
      dispatch(openEditPlaylistModal({ collectionId: id }))
      record(make(Name.PLAYLIST_OPEN_EDIT_FROM_LIBRARY, {}))
    }
  }, [dispatch, id, record])

  const handleShare = useCallback(() => {
    if (typeof id === 'number') {
      dispatch(
        requestOpen({
          type: 'collection',
          collectionId: id,
          source: ShareSource.LEFT_NAV
        })
      )
    }
  }, [dispatch, id])

  const handleDelete = useCallback(() => {
    toggleDeleteConfirmationOpen()
  }, [toggleDeleteConfirmationOpen])

  const kebabItems: PopupMenuItem[] = [
    {
      text: messages.edit,
      onClick: handleEdit
    },
    { text: messages.share, onClick: handleShare },
    { text: messages.delete, onClick: handleDelete }
  ]

  const handleDrop = useCallback(
    (draggingId: PlaylistLibraryID, kind: DragDropKind) => {
      if (kind === 'track') {
        if (typeof id === 'number') {
          dispatch(addTrackToPlaylist(draggingId as ID, id))
        }
      } else {
        dispatch(
          reorder({
            draggingId,
            droppingId: id,
            draggingKind: kind as PlaylistLibraryKind
          })
        )
      }
    },
    [dispatch, id]
  )

  const draggingKind = useSelector(selectDraggingKind)
  const draggingId = useSelector(selectDraggingId)
  const track = useSelector((state) =>
    getTrack(state, { id: typeof draggingId === 'string' ? null : draggingId })
  )
  const collection = useSelector((state) =>
    getCollection(state, { id: typeof id === 'string' ? null : id })
  )

  const hiddenTrackCheck =
    !!track && !!collection && track?.is_unlisted && !collection?.is_private

  const isDisabled =
    (draggingKind === 'track' && !isOwned) ||
    draggingId === id ||
    (draggingKind === 'playlist-folder' && level > 0) ||
    hiddenTrackCheck

  if (!name || !url) return null

  return (
    <>
      <LeftNavDroppable
        acceptedKinds={acceptedKinds}
        onDrop={handleDrop}
        disabled={isDisabled}
      >
        <Draggable
          id={id}
          text={name}
          // Draggables require full URL
          link={`${BASE_URL}${url}`}
          kind='library-playlist'
        >
          <LeftNavLink
            to={url}
            onClick={onClick}
            disabled={isDisabled}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={styles.root}
          >
            <span
              className={cn(styles.content, {
                [styles.level1]: level === 1
              })}
            >
              {hasUpdate ? <PlaylistUpdateDot /> : null}
              <span className={styles.collectionName}>{name}</span>
              <NavItemKebabButton
                visible={isOwned && isHovering && !isDraggingOver}
                aria-label={messages.editPlaylistLabel}
                items={kebabItems}
              />
            </span>
          </LeftNavLink>
        </Draggable>
      </LeftNavDroppable>

      {isOwned && typeof id === 'number' ? (
        <DeleteCollectionConfirmationModal
          collectionId={id}
          visible={isDeleteConfirmationOpen}
          onCancel={toggleDeleteConfirmationOpen}
        />
      ) : null}
    </>
  )
}
