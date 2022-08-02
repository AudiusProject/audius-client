import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  forwardRef,
  MouseEventHandler
} from 'react'

import cn from 'classnames'
import uniqueId from 'lodash/uniqueId'
import ReactDOM from 'react-dom'
import { animated, useTransition } from 'react-spring'
import { useEffectOnce } from 'react-use'

import { IconRemove } from 'components/Icons'
import { useClickOutside } from 'hooks/useClickOutside'
import { useHotkeys } from 'hooks/useHotKeys'
import { useScrollLock } from 'hooks/useScrollLock'
import { findAncestor } from 'utils/findAncestor'
import { standard } from 'utils/transitions'

import styles from './Modal.module.css'
import { ModalContext } from './ModalContext'
import { useModalScrollCount } from './hooks'
import { ModalProps, Anchor } from './types'

const rootContainer = 'modalRootContainer'
const rootId = 'modalRoot'
const bgId = 'bgModal'
const wrapperClass = 'modalWrapper'

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

const useModalRoot = (id: string, zIndex?: number) => {
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null)
  const [modalBg, setModalBg] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const uniqueRootId = `${id}-${rootId}`
    const uniqueBgId = `${id}-${bgId}`
    const uniqueRootContainerId = `${id}-${rootContainer}`
    let el = document.getElementById(uniqueRootId)
    let bgEl = document.getElementById(uniqueBgId)
    let container = document.getElementById(uniqueRootContainerId)

    if (!bgEl) {
      bgEl = document.createElement('div')
      bgEl.id = uniqueBgId
      bgEl.classList.add(bgId)
      document.body.appendChild(bgEl)
    }

    if (!container) {
      container = document.createElement('div')
      container.id = uniqueRootContainerId
      container.classList.add(rootContainer)
      document.body.appendChild(container)
    }

    if (!el) {
      el = document.createElement('div')
      el.id = uniqueRootId
      el.classList.add(rootId)
      container.appendChild(el)
    }

    if (zIndex) {
      container.style.zIndex = `${zIndex}`
      el.style.zIndex = `${zIndex}`
      bgEl.style.zIndex = `${zIndex - 1}`
    }

    setModalRoot(el)
    setModalBg(bgEl)
  }, [id, zIndex])

  return [modalRoot, modalBg]
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    'aria-describedby': ariaDescribedbyProp,
    'aria-labelledby': ariaLabelledbyProp,
    modalKey,
    children,
    onClose,
    onClosed,
    isOpen,
    wrapperClassName,
    bodyClassName,
    titleClassName,
    subtitleClassName,
    headerContainerClassName,
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
  },
  ref
) {
  useEffectOnce(() => {
    if (process.env.NODE_ENV !== 'production') {
      if (
        subtitle ||
        title ||
        showTitleHeader ||
        titleClassName ||
        subtitleClassName ||
        headerContainerClassName ||
        showDismissButton
      ) {
        console.warn(
          'Header and title-related props of `Modal` have been deprecated. Use the `ModalHeader` sub-component instead.'
        )
      }

      if (allowScroll !== undefined) {
        console.warn('`allowScroll` prop of `Modal` has been deprecated.')
      }
    }
  })

  const id = useMemo(() => modalKey || uniqueId('modal-'), [modalKey])
  const titleId = `${id}-title` || ariaLabelledbyProp
  const subtitleId = `${id}-subtitle` || ariaDescribedbyProp
  const modalContextValue = useMemo(() => {
    return { titleId, subtitleId }
  }, [titleId, subtitleId])

  const onTouchMove = useCallback(
    (e: any) => {
      !allowScroll && e.preventDefault()
    },
    [allowScroll]
  )

  const [modalRoot, bgModal] = useModalRoot(id, zIndex)
  const [isDestroyed, setIsDestroyed] = useState(isOpen)
  const { incrementScrollCount, decrementScrollCount } = useModalScrollCount()
  useScrollLock(isDestroyed, incrementScrollCount, decrementScrollCount)

  useEffect(() => {
    if (isOpen) setIsDestroyed(true)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      if (bgModal) {
        bgModal.classList.add('bgModalVisible')
      }

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
    config: standard,
    onDestroyed: () => {
      if (!isOpen) {
        setIsDestroyed(false)
        if (onClosed) {
          onClosed()
        }
      }
    }
  })

  const outsideClickRef = useClickOutside(
    onClose,
    // Check to see if the click outside is not another modal wrapper.
    // If it is, that means we have a nested modal situation and shouldn't
    // dismiss "this" modal. We let the useClickOutside in "that" modal to
    // dismiss it.
    (e: EventTarget) => {
      // Only close if we're open.
      // Closing when we're not open can cause a race condition when opened
      // via a click since this handler exists prior to visibility,
      // causing the modal to open and close immediately
      if (!isOpen) {
        return true
      }
      if (e instanceof Element) {
        const modalElement = findAncestor(e, `.${wrapperClass}`)
        if (!modalElement) {
          return false
        }
        const isModalWrapper = modalElement.classList.contains(wrapperClass)
        const isThisModalWrapper = modalElement.classList.contains(
          `${wrapperClass}-${id}`
        )
        return isModalWrapper && !isThisModalWrapper
      }
      return false
    },
    isOpen
  )

  const handleEscape = useCallback(() => {
    if (isOpen) onClose()
  }, [isOpen, onClose])

  useHotkeys({ 27 /* escape */: handleEscape })

  const wrapperClassNames = cn(
    styles.wrapper,
    anchorStyleMap[anchor],
    {
      [wrapperClassName!]: !!wrapperClassName
    },
    wrapperClass,
    // Add a unique id class name to detect whether, if we're using
    // click outside to dismiss the modal, the correct "outside" is being clicked.
    `${wrapperClass}-${id}`
  )

  const wrapperStyle = {
    paddingLeft: `${horizontalPadding}px`,
    paddingRight: `${horizontalPadding}px`
  }

  /** Begin @deprecated section (favor using ModalContent sub-component)  */
  const bodyStyle = {
    paddingLeft: `${contentHorizontalPadding}px`,
    paddingRight: `${contentHorizontalPadding}px`
  }
  /** End @deprecated section  */

  const bodyClassNames = cn(styles.body, {
    [styles.noScroll!]: !allowScroll,
    [bodyClassName!]: !!bodyClassName
  })

  const headerContainerClassNames = cn(styles.headerContainer, {
    [headerContainerClassName!]: !!headerContainerClassName
  })

  const [height, setHeight] = useState(window.innerHeight)

  useEffect(() => {
    const onResize = () => {
      setHeight(window.innerHeight)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [setHeight])

  const bodyOffset = getOffset(anchor, verticalAnchorOffset)

  const handleModalContentClicked: MouseEventHandler = (e) => {
    e.stopPropagation()
  }
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
                    ref={ref}
                  >
                    <animated.div
                      ref={dismissOnClickOutside ? outsideClickRef : null}
                      className={bodyClassNames}
                      style={{ ...props, ...bodyOffset, ...bodyStyle }}
                      role='dialog'
                      aria-labelledby={titleId}
                      aria-describedby={subtitleId}
                      onClick={handleModalContentClicked}
                    >
                      <>
                        {/** Begin @deprecated section (moved to ModalHeader and ModalTitle sub-components)  */}
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
                            <div
                              id={titleId}
                              className={cn(styles.header, titleClassName)}
                            >
                              {title}
                            </div>
                            <div
                              id={subtitleId}
                              className={cn(styles.subtitle, subtitleClassName)}
                            >
                              {subtitle}
                            </div>
                          </div>
                        )}
                        {/** End @deprecated section  */}
                        <ModalContext.Provider value={modalContextValue}>
                          {children}
                        </ModalContext.Provider>
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
})
