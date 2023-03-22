import { MutableRefObject, ReactChild } from 'react'

export enum Position {
  TOP_LEFT = 'topLeft',
  TOP_CENTER = 'topCenter',
  TOP_RIGHT = 'topRight',
  BOTTOM_LEFT = 'bottomLeft',
  BOTTOM_CENTER = 'bottomCenter',
  BOTTOM_RIGHT = 'bottomRight'
}

export enum Alignment {
  /**
   * Align such that the popup is flush with the horizontal position of the anchor
   */
  HORIZONTAL_INNER = 'horizontal',
  /**
   * Align such that the popup is flush with the vertical position of the anchor
   */
  VERTICAL_INNER = 'vertical',
  /**
   * Align such that the popup is on a corner of the anchor
   */
  OUTER = 'outer'
}

export type PopupProps = {
  /**
   * A ref to the element whose position will be used to anchor the Popup
   */
  anchorRef: MutableRefObject<HTMLElement | null>

  /**
   * Duration of the animations in ms
   */
  animationDuration?: number

  /**
   * A function used to check if a click falls inside any element
   * that should not close the popup. Clicks inside the menu itself
   * are automatically considered inside
   */
  checkIfClickInside?: (target: EventTarget) => boolean

  /**
   * Children to render inside the Popup
   */
  children: ReactChild

  /**
   * Class name to apply to the popup itself
   */
  className?: string

  /**
   * Class name to apply to the popup title
   */
  titleClassName?: string

  /**
   * An optional container ref that controls what the popup considers
   * to be the size of the container it belongs to. If the popup expands outside
   * the bounds of the container, it repositions itself.
   */
  containerRef?: MutableRefObject<HTMLDivElement | undefined>

  /**
   * Boolean representing whether the Popup is visible
   */
  isVisible: boolean

  /**
   * Show the header
   */
  showHeader?: boolean

  /**
   * Hide the close button when displaying the header
   */
  hideCloseButton?: boolean

  /**
   * Fired when a close event is dispatched, but the animation is not necessarily finished
   */
  onClose: () => void

  /**
   * Fired after the popup finishes closing
   */
  onAfterClose?: () => void

  /**
   * The position of the Popup relative to the trigger
   */
  position?: Position

  /**
   * The alignment of the Popup relative to the trigger (only affects non-center positions, as it's used to determine which edge to align with)
   */
  alignment?: Alignment

  /**
   * A title displayed at the top of the Popup (only visible when the header is enabled)
   */
  title?: string

  /**
   * An optional className to apply to the wrapper element.
   * The wrapper element is used to absolutely position the popup on the page in relation to the anchor element
   */
  wrapperClassName?: string

  /**
   * An optional z-index to override the default of 10000
   */
  zIndex?: number
}

export const popupDefaultProps = {
  animationDuration: 90,
  onAfterClose: () => {}
}
