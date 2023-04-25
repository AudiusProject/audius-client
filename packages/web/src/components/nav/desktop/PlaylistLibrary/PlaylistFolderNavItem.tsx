import { useCallback, useState, MouseEvent, useEffect } from 'react'

import {
  PlaylistLibraryFolder,
  Name,
  modalsActions,
  PlaylistLibraryID,
  playlistLibraryActions,
  PlaylistLibraryKind
} from '@audius/common'
import { IconFolder, IconFolderOutline, IconCaretRight } from '@audius/stems'
import cn from 'classnames'
import { isEmpty } from 'lodash'
import { useDispatch } from 'react-redux'
import { useToggle } from 'react-use'

import { make, useRecord } from 'common/store/analytics/actions'
import { Draggable, Droppable } from 'components/dragndrop'
import { setFolderId as setEditFolderModalFolderId } from 'store/application/ui/editFolderModal/slice'
import { DragDropKind } from 'store/dragndrop/slice'

import { LeftNavLink } from '../LeftNavLink'

import { EditNavItemButton } from './EditNavItemButton'
import styles from './PlaylistFolderNavItem.module.css'
import { PlaylistLibraryNavItem, keyExtractor } from './PlaylistLibraryNavItem'
const { setVisibility } = modalsActions
const { addToFolder } = playlistLibraryActions

type PlaylistFolderNavItemProps = {
  folder: PlaylistLibraryFolder
  level: number
}

const longDragTimeoutMs = 1000

const acceptedKinds: DragDropKind[] = ['playlist', 'library-playlist']

const messages = {
  editFolderLabel: 'More folder actions'
}

export const PlaylistFolderNavItem = (props: PlaylistFolderNavItemProps) => {
  const { folder, level } = props
  const { name, contents, id } = folder
  const hasUpdate = false
  const [isExpanded, toggleIsExpanded] = useToggle(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const isEmptyFolder = isEmpty(contents)
  const dispatch = useDispatch()
  const record = useRecord()

  const handleDrop = useCallback(
    (id: PlaylistLibraryID, kind: DragDropKind) => {
      dispatch(
        addToFolder({
          folder,
          draggingId: id,
          draggingKind: kind as PlaylistLibraryKind
        })
      )
    },
    [dispatch, folder]
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
    setIsDraggingOver(false)
    setIsHovering(false)
  }, [])

  const handleClickEdit = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.stopPropagation()
      dispatch(setEditFolderModalFolderId(id))
      dispatch(setVisibility({ modal: 'EditFolder', visible: true }))
      record(make(Name.FOLDER_OPEN_EDIT, {}))
    },
    [dispatch, id, record]
  )

  useEffect(() => {
    if (isDraggingOver && !isExpanded) {
      const longDragTimeout = setTimeout(toggleIsExpanded, longDragTimeoutMs)
      return () => clearTimeout(longDragTimeout)
    }
  }, [isDraggingOver, isExpanded, toggleIsExpanded])

  return (
    <Droppable
      acceptedKinds={acceptedKinds}
      onDrop={handleDrop}
      hoverClassName={styles.droppableHover}
    >
      <Draggable id={id} text={name} kind='playlist-folder'>
        <LeftNavLink
          className={cn(styles.root, { [styles.dragging]: isDraggingOver })}
          onClick={toggleIsExpanded}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {isEmptyFolder ? (
            <IconFolderOutline
              width={12}
              height={12}
              className={styles.iconFolder}
            />
          ) : (
            <IconFolder
              width={12}
              height={12}
              className={cn(styles.iconFolder, {
                [styles.iconFolderUpdated]: hasUpdate
              })}
            />
          )}
          <div className={styles.libraryLinkTextContainer}>
            <span>{name}</span>
          </div>
          <IconCaretRight
            height={11}
            width={11}
            className={cn(styles.iconCaret, {
              [styles.iconCaretDown]: isExpanded
            })}
          />
          {isHovering && !isDraggingOver ? (
            <EditNavItemButton
              aria-label={messages.editFolderLabel}
              onClick={handleClickEdit}
            />
          ) : null}
        </LeftNavLink>
        {isExpanded ? (
          <ul>
            {contents.map((content) => (
              <PlaylistLibraryNavItem
                key={keyExtractor(content)}
                item={content}
                level={level + 1}
              />
            ))}
          </ul>
        ) : null}
      </Draggable>
    </Droppable>
  )
}
