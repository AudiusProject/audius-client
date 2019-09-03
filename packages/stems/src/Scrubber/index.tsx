import React, { useState, useEffect, useCallback, useRef } from 'react'
import cn from 'classnames'

import ScrubberProps from './types'
import styles from './styles.module.css'

const CHECKUP_INTERVAL = 200

const getXPosition = (element: HTMLDivElement): number => {
  const coords = element.getBoundingClientRect()
  return window.pageXOffset + coords.left
}

const getWidth = (element: HTMLDivElement): number => {
  return element.offsetWidth
}

const Scrubber = ({
  isPlaying,
  isDisabled,
  elapsedSeconds,
  totalSeconds
  // onScrubStart,
  // onScrubRelease
}: ScrubberProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const dragPercent = useRef<number>(0)
  // const [draggingPosition, setDraggingPosition] = useState(false)

  const railRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)

  const intervalRef = useRef<number | undefined>(undefined)

  const animate = (transition: string, transform: string) => {
    // console.log(transition, transform)
    if (handleRef.current && trackRef.current) {
      handleRef.current.style.transition = transition
      handleRef.current.style.transform = transform

      trackRef.current.style.transition = transition
      trackRef.current.style.transform = transform
    }
  }

  const play = useCallback(() => {
    // console.log('play')
    const timeRemaining = totalSeconds - elapsedSeconds
    animate(`transform ${timeRemaining}s linear`, 'translate(0%)')
  }, [totalSeconds, elapsedSeconds])

  const pause = useCallback(() => {
    // console.log('pause')
    const percentComplete = elapsedSeconds / totalSeconds * 100
    // console.log(percentComplete, totalSeconds,)
    animate('none', `translate(${-100 + percentComplete}%)`)
  }, [totalSeconds, elapsedSeconds])

  const set = (percentComplete: number) => {
    animate('none', `translate(${-100 + percentComplete}%)`)
  }

  // useEffect(() => {
  //   intervalRef.current = window.setInterval(() => {
  //     // console.log('udpating')
  //     // animate('1', '2')
  //   }, CHECKUP_INTERVAL)
  //   return () => clearInterval(intervalRef.current)
  // }, [intervalRef])

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      if (!isDragging) {
        console.log('do thing')
        if (isPlaying) {
          play()
        } else {
          pause()
        }
      }
      // console.log('udpating')
      // animate('1', '2')
    }, CHECKUP_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [isPlaying, isDragging, intervalRef, pause, play])

  const setDragPercent = (e: React.MouseEvent | MouseEvent) => {
    const clickPosition = e.pageX - getXPosition(railRef.current)
    const railWidth = getWidth(railRef.current)
    const percent = Math.min(Math.max(0, clickPosition), railWidth) / railWidth * 100
    dragPercent.current = percent
  }

  const onMouseMove = (e: MouseEvent) => {
    // e.stopPropagation()
    // e.preventDefault()
    setDragPercent(e)
    console.log('on scrub ', dragPercent.current)
    set(dragPercent.current)
    // console.log(dragPercent.current)
  }

  const onMouseUp = () => {
    // e.stopPropagation()
    // e.preventDefault()
    // console.log(e)

    setIsDragging(false)

    document.removeEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    console.log('on scrub release ', dragPercent.current)
  }

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (e.button !== 0) return

    setIsDragging(true)

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    console.log(isDragging)

    // console.log(e)
    // console.log(e.pageX, isDragging)
    // console.log(getXPosition(railRef.current))
    setDragPercent(e)

    // console.log(percent)

    // const isVertical = this.props.vertical;
    // let position = utils.getMousePosition(isVertical, e);
    // if (!utils.isEventFromHandle(e, this.handlesRefs)) {
    //   this.dragOffset = 0;
    // } else {
    //   const handlePosition = utils.getHandleCenterPosition(isVertical, e.target);
    //   this.dragOffset = position - handlePosition;
    //   position = handlePosition;
    // }
    // this.removeDocumentEvents();
    // this.onStart(position);
    // this.addDocumentMouseEvents();
  }

  // const onFocus = () => {

  // }

  // const onBlur = () => {

  // }

  return (
    <div
      ref={railRef}
      className={cn(styles.scrubber, {
        [styles.isDisabled]: isDisabled
      })}
      onMouseDown={isDisabled ? () => {} : onMouseDown}
      // onMouseUp={isDisabled ? () => {} : onMouseUp}
      // onFocus={isDisabled ? () => {} : onFocus}
      // onBlur={isDisabled ? () => {} : onBlur}
    >
      <div className={styles.rail}>
        <div ref={trackRef} className={styles.trackWrapper}>
          <div ref={trackRef} className={styles.track} />
        </div>
      </div>
      <div ref={handleRef} className={styles.handleWrapper}>
        <div ref={handleRef} className={styles.handle} />
      </div>
    </div>
  )
}

export default Scrubber
