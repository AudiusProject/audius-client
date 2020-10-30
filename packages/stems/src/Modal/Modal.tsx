import React, { useEffect, useState, useCallback } from 'react'
import ReactDOM from 'react-dom'

import cn from 'classnames'
import { animated, useTransition } from 'react-spring'
import styles from './Modal.module.css'

import { ModalProps, Anchor } from './types'

import { IconRemove } from 'Icons'
import useHotkeys from 'hooks/useHotKeys'
import useClickOutside from 'hooks/useClickOutside'
import useScrollLock from 'hooks/useScrollLock'

const rootContainer = 'modalRootContainer'
const rootId = 'modalRoot'
const bgId = 'bgModal'

const anchorStyleMap = {
  [Anchor.TOP]: styles.top,
  [Anchor.CENTER]: styles.center,
  [Anchor.BOTTOM]: styles.bottom
}

const anchorPropertyMap = {
  [Anchor.TOP]: 'marginTop',
  [Anchor.CENTER]: 'marginTop',
  [Anchor.BOTTOM]: 'marginBottom'
}

const getOffset = (anchor: Anchor, verticalAnchorOffset: number) => {
  return { [anchorPropertyMap[anchor]]: verticalAnchorOffset }
}

const useModalRoot = (zIndex?: number) => {
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null)
  const [modalBg, setModalBg] = useState<HTMLElement | null>(null)

  useEffect(() => {
    let el = document.getElementById(rootId)
    let bgEl = document.getElementById(bgId)
    let container = document.getElementById(rootContainer)

    if (!container) {
      container = document.createElement('div')
      container.id = rootContainer
      document.body.appendChild(container)
    }

    if (!el) {
      el = document.createElement('div')
      el.id = rootId
      container.appendChild(el)
    }

    if (!bgEl) {
      bgEl = document.createElement('div')
      bgEl.id = bgId
      document.body.appendChild(bgEl)
    }

    if (zIndex) {
      container.style.zIndex = `${zIndex}`
      el.style.zIndex = `${zIndex}`
      bgEl.style.zIndex = `${zIndex - 1}`
    }

    setModalRoot(el)
    setModalBg(bgEl)
  }, [zIndex])

  return [modalRoot, modalBg]
}

const Modal = ({
  children,
  onClose,
  isOpen,
  wrapperClassName,
  bodyClassName,
  titleClassName,
  subtitleClassName,
  headerContainerClassName,
  incrementScrollCount,
  decrementScrollCount,
  anchor = Anchor.CENTER,
  subtitle,
  verticalAnchorOffset = 0,
  horizontalPadding = 8,
  contentHorizontalPadding = 0,
  allowScroll = false,
  title = '',
  showTitleHeader = false,
  dismissOnClickOutside = true,
  showDismissButton = false,
  zIndex
}: ModalProps) => {
  const onTouchMove = useCallback(
    (e: any) => {
      !allowScroll && e.preventDefault()
    },
    [allowScroll]
  )

  const [modalRoot, bgModal] = useModalRoot(zIndex)
  const [isDestroyed, setIsDestroyed] = useState(isOpen)

  useScrollLock(isDestroyed, incrementScrollCount, decrementScrollCount)
  useEffect(() => {
    if (isOpen) setIsDestroyed(true)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      if (bgModal) bgModal.classList.add('bgModalVisible')

      // Need to prevent safari iOS bounce
      // overscroll effect by intercepting
      // touchmove events.
      if (modalRoot) modalRoot.addEventListener('touchmove', onTouchMove)
      return () => {
        if (bgModal) bgModal.classList.remove('bgModalVisible')
      }
    }

    if (bgModal) bgModal.classList.remove('bgModalVisible')
    if (modalRoot) modalRoot.removeEventListener('touchmove', onTouchMove)
    return () => {}
  }, [isOpen, bgModal, onTouchMove, modalRoot])

  const transition = useTransition(isOpen, null, {
    from: { transform: 'scale(0)', opacity: 0 },
    enter: { transform: 'scale(1)', opacity: 1 },
    leave: { transform: 'scale(0)', opacity: 0 },
    unique: true,
    config: {
      tension: 310,
      friction: 26,
      clamp: true
    },
    onDestroyed: () => {
      if (!isOpen) setIsDestroyed(false)
    }
  })

  const outsideClickRef = useClickOutside(onClose)
  useHotkeys({ 27 /* escape */: onClose })

  const wrapperClassNames = cn(styles.wrapper, anchorStyleMap[anchor], {
    [wrapperClassName!]: !!wrapperClassName
  })

  const wrapperStyle = {
    paddingLeft: `${horizontalPadding}px`,
    paddingRight: `${horizontalPadding}px`
  }

  const bodyStyle = {
    paddingLeft: `${contentHorizontalPadding}px`,
    paddingRight: `${contentHorizontalPadding}px`
  }

  const bodyClassNames = cn(styles.body, {
    [styles.noScroll!]: !allowScroll,
    [bodyClassName!]: !!bodyClassName
  })

  const headerContainerClassNames = cn(styles.headerContainer, {
    [headerContainerClassName!]: !!headerContainerClassName
  })

  const [height, setHeight] = useState(window.innerHeight)
  useEffect(() => {
    const onResize = () => setHeight(window.innerHeight)
    window.addEventListener('resize', onResize)
    return window.removeEventListener('resize', onResize)
  }, [setHeight])

  const bodyOffset = getOffset(anchor, verticalAnchorOffset)
  return (
    <>
      {modalRoot &&
        ReactDOM.createPortal(
          <>
            {transition.map(
              ({ item, props, key }) =>
                item && (
                  <animated.div
                    className={wrapperClassNames}
                    style={{
                      ...wrapperStyle,
                      opacity: props.opacity,
                      height,
                      minHeight: height
                    }}
                    key={key}
                  >
                    <animated.div
                      ref={dismissOnClickOutside ? outsideClickRef : null}
                      className={bodyClassNames}
                      style={{ ...props, ...bodyOffset, ...bodyStyle }}
                      key={key}
                    >
                      <>
                        {showTitleHeader && (
                          <div className={headerContainerClassNames}>
                            {showDismissButton && (
                              <div
                                className={styles.dismissButton}
                                onClick={onClose}
                              >
                                <IconRemove />
                              </div>
                            )}
                            <div className={cn(styles.header, titleClassName)}>
                              {title}
                            </div>
                            <div
                              className={cn(styles.subtitle, subtitleClassName)}
                            >
                              {subtitle}
                            </div>
                          </div>
                        )}
                        {children}
                      </>
                    </animated.div>
                  </animated.div>
                )
            )}
          </>,
          modalRoot
        )}
    </>
  )
}

export default Modal
