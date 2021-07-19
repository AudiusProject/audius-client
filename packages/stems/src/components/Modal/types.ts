import { ReactNode } from 'react'

export enum Anchor {
  CENTER = 'CENTER',
  TOP = 'TOP',
  BOTTOM = 'BOTTOM'
}

export type ModalProps = {
  /**
   * Optional unique key to assign to the modal.
   * If not provided, it is auto-generated.
   */
  modalKey?: string

  /**
   * Modal contents
   */
  children: ReactNode

  /**
   * Callback to fire when the modal is closed
   * Should set isOpen accordingly
   */
  onClose: () => void

  /**
   * Whether or not the modal is open
   */
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
   * Manually set z-index.
   *
   * By default, the z-index is 10000 and the modal background shadow is
   * set to z-index - 1 so that the modal appears on top of the shadow.
   *
   * If you would like to nest modals, it's important to increase the z-index by
   * 2 for every modal so that the parent modal lives behind the child modal's shadow.
   */
  zIndex?: number

  allowScroll?: boolean

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
