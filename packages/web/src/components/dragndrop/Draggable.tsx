import { DragEvent, ReactNode, useCallback } from 'react'

import { ID } from '@audius/common'
import { useDispatch } from 'react-redux'

import { DragDropKind, drag, drop } from 'store/dragndrop/slice'

import styles from './Draggable.module.css'

const isFirefox = () => navigator.userAgent.includes('Firefox')

const messages = {
  defaultText: 'Untitled'
}

export type DraggableProps = {
  isDisabled?: boolean
  isOwner?: boolean
  text?: string
  link?: string
  kind: DragDropKind
  id: ID | string // One of trackId, collectionId, userId
  index?: number
  children: ReactNode
  onDrag?: () => void
  onDrop?: () => void
}

export const Draggable = (props: DraggableProps) => {
  const {
    isDisabled,
    text = messages.defaultText,
    kind,
    link = 'https://audius.co',
    id,
    index,
    isOwner,
    onDrag,
    onDrop,
    children,
    ...otherProps // passed to child
  } = props
  const dispatch = useDispatch()

  const handleDragStart = useCallback(
    (e: DragEvent) => {
      e.stopPropagation()
      dispatch(drag({ kind, id, isOwner, index }))

      const dt = e.dataTransfer
      dt.effectAllowed = 'copy'

      // If we set the URL on firefox,
      // it forces a site refresh
      // on drop
      if (!isFirefox()) {
        dt.setData('text/uri-list', link)
        dt.setData('text/plain', link)
      }

      if (dt.setDragImage) {
        const wrapper = document.createElement('div')
        wrapper.setAttribute('id', 'ghost')

        const content = document.createElement('div')
        content.innerHTML = text

        wrapper.append(content)
        document.body.append(wrapper)

        dt.setDragImage(wrapper, 0, 0)
      }
      onDrag?.()
    },
    [dispatch, kind, id, isOwner, index, link, text, onDrag]
  )

  const handleDragEnd = useCallback(() => {
    const dragGhostElement = document.getElementById('ghost')
    if (dragGhostElement) {
      dragGhostElement.outerHTML = ''
    }
    dispatch(drop())
    onDrop?.()
  }, [dispatch, onDrop])

  return (
    <div
      draggable={!isDisabled}
      className={styles.draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      {...otherProps}
    >
      {children}
    </div>
  )
}
