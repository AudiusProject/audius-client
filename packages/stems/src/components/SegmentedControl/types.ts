export type Option<T> = {
  key: T
  text: string
}

export type SegmentedControlProps<T extends string> = {
  // The options to display for the tab slider
  options: Array<Option<T>>

  // References the key of an available option that is selected
  selected: string

  // Called on select option
  onSelectOption: (key: T) => void

  fullWidth?: boolean

  disabled?: boolean

  isMobile?: boolean

  /**
   * Escape hatch for styles.
   */
  className?: string

  /**
   * Styles specificlaly applied to slider text
   */
  textClassName?: string

  /**
   * Styles applied only to active cell text
   */
  activeTextClassName?: string

  /**
   * The label for the radio group
   */
  label?: string
}
