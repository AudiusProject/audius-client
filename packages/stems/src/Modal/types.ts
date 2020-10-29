import { ReactNode } from 'react'

export enum Anchor {
  CENTER = 'CENTER',
  TOP = 'TOP',
  BOTTOM = 'BOTTOM'
}

export type ModalProps = {
  children: ReactNode
  onClose: () => void
  isOpen: boolean

  /**
   * Whether to render a header
   * with a title and dismiss button
   */
  showTitleHeader?: boolean
  title?: React.ReactNode
  subtitle?: string

  /**
   * Whether to dismiss on a click outside the modal
   */
  dismissOnClickOutside?: boolean

  /**
   * Whether to show a dismiss 'X' in the top left
   */
  showDismissButton?: boolean

  /**
   * Manually set z-index
   */
  zIndex?: number

  allowScroll?: boolean

  // Increments the scroll count for scrollLock
  incrementScrollCount: () => void

  // Decrements the scroll count for scrollLock
  decrementScrollCount: () => void

  // Classnames

  wrapperClassName?: string

  /**
   *  Set max-width on bodyClass to set the modal width
   */
  bodyClassName?: string
  titleClassName?: string
  subtitleClassName?: string
  headerContainerClassName?: string

  anchor?: Anchor
  verticalAnchorOffset?: number

  /**
   * Horizontal padding between modal edges and viewport edge
   */
  horizontalPadding?: number

  /**
   * Horizontal padding between outside of modal and inner content
   */
  contentHorizontalPadding?: number
}

export default ModalProps
