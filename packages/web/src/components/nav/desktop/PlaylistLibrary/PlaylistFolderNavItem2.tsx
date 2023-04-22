import { useCallback, useEffect, useState } from 'react'

import { PlaylistLibraryFolder } from '@audius/common'
import {
  IconFolder,
  IconFolderOutline,
  IconCaretRight,
  IconKebabHorizontal,
  IconButton
} from '@audius/stems'
import cn from 'classnames'
import { isEmpty } from 'lodash'
import { useTimeout, useToggle } from 'react-use'

import { Droppable } from 'components/dragndrop'

import { LeftNavItem } from '../LeftNavLink'

import styles from './PlaylistFolderNavItem.module.css'
import { PlaylistNavItem } from './PlaylistNavItem2'

type PlaylistFolderNavItemProps = {
  folder: PlaylistLibraryFolder
}

const acceptedKinds = ['playlist' as const]

const longDragTimeoutMs = 500

export const PlaylistFolderNavItem = (props: PlaylistFolderNavItemProps) => {
  const { folder } = props
  const { name, contents } = folder
  const hasUpdate = false
  const isHovering = false
  const dragging = false
  const [isExpanded, toggleIsExpanded] = useToggle(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const isEmptyFolder = isEmpty(contents)
  const [playlistDropIndex, setPlaylistDropIndex] = useState<number | null>(
    null
  )

  const handleDrop = useCallback((id, kind) => {
    console.log('dropped into folder', id, kind)
  }, [])

  const handleDragEnter = useCallback(() => {
    setIsDraggingOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDraggingOver(false)
  }, [])

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
      <LeftNavItem
        className={cn(styles.root, { [styles.dragging]: isDraggingOver })}
        onClick={toggleIsExpanded}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
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
        <IconButton
          aria-label='More playlist actions'
          className={cn(styles.iconKebabHorizontal, {
            [styles.hidden]: !isHovering || dragging
          })}
          icon={<IconKebabHorizontal height={11} width={11} />}
        />
      </LeftNavItem>
      {isExpanded ? (
        <div>
          {contents
            .filter((content) => content.type === 'playlist')
            .map((content) => (
              <PlaylistNavItem
                key={content.playlist_id}
                playlistId={content.playlist_id}
                level={1}
              />
            ))}
        </div>
      ) : null}
    </Droppable>
  )
}
