import React, { useRef, useState } from 'react'

import throttle from 'lodash/throttle'

export type DragAutoscrollerProps = {
  children: React.ReactNode
  containerBoundaries: {
    top: number
    bottom: number
    left: number
    right: number
  }
  updateScrollTopPosition: (difference: number) => void
  onChangeDragScrollingDirection: (
    newDirection: 'up' | 'down' | undefined
  ) => void
}

/** Helper component to be used inside a Stems Scrollbar component to allow
 * the container to auto-scroll when items are being dragged.
 */
export const DragAutoscroller = ({
  children,
  containerBoundaries,
  updateScrollTopPosition,
  onChangeDragScrollingDirection
}: DragAutoscrollerProps) => {
  const [scrolling, setScrolling] = useState<undefined | 'up' | 'down'>()
  const scrollingRef = useRef(scrolling)
  scrollingRef.current = scrolling

  const scroll = (direction: 'up' | 'down') => {
    const difference = direction === 'up' ? -5 : 5
    updateScrollTopPosition(difference)
    if (scrollingRef.current != null) {
      setTimeout(() => scroll(scrollingRef.current!), 20)
    }
  }

  const throttledHandleDragHelper = throttle(
    (clientX: number, clientY: number) => {
      const isInRightLeftBounds =
        clientX &&
        clientX > containerBoundaries.left &&
        clientX < containerBoundaries.right
      if (
        clientY &&
        clientY <= containerBoundaries.top + 16 &&
        isInRightLeftBounds
      ) {
        if (scrollingRef.current !== 'up') {
          setScrolling('up')
          onChangeDragScrollingDirection('up')
          setTimeout(() => scroll('up'), 20)
        }
      } else if (
        clientY &&
        clientY >= containerBoundaries.bottom - 16 &&
        isInRightLeftBounds
      ) {
        if (scrollingRef.current !== 'down') {
          setScrolling('down')
          onChangeDragScrollingDirection('down')
          setTimeout(() => scroll('down'), 20)
        }
      } else if (scrollingRef.current != null) {
        onChangeDragScrollingDirection(undefined)
        setScrolling(undefined)
      }
    },
    200
  )

  const handleDrag: React.DragEventHandler<HTMLDivElement> = e => {
    const clientX = e.clientX
    const clientY = e.clientY
    throttledHandleDragHelper(clientX, clientY)
  }

  const handleDragEnd: React.DragEventHandler<HTMLDivElement> = () => {
    setScrolling(undefined)
    onChangeDragScrollingDirection(undefined)
  }

  return (
    <div
      // This gets called repeatedly during drag if dragged item comes from outside the container
      onDragEnter={handleDrag}
      // This gets called repeatedly during drag if dragged item is inside the container
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
    >
      {children}
    </div>
  )
}
