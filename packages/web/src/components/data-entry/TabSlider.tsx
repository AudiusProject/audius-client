import { createRef, Fragment, useState, useEffect, useRef } from 'react'

import { ResizeObserver } from '@juggle/resize-observer'
import cn from 'classnames'
import { mergeRefs } from 'react-merge-refs'
import { useSpring, animated } from 'react-spring'
import useMeasure, { RectReadOnly } from 'react-use-measure'

import styles from './TabSlider.module.css'

const TabSlider = (props: TabSliderProps) => {
  const optionRefs = useRef(
    props.options.map((_) => createRef<HTMLLabelElement>())
  )
  const lastBounds = useRef<RectReadOnly>()
  const [selected, setSelected] = useState(props.options[0].key)

  const selectedOption = props.selected || selected

  const onSetSelected = (option: SliderOption) => {
    // Call props function if controlled
    if (props.onSelectOption) props.onSelectOption(option)
    setSelected(option)
  }

  const [animatedProps, setAnimatedProps] = useSpring(() => ({
    to: { left: '0px', width: '0px' }
  }))

  // Watch for resizes and repositions so that we move and resize the slider appropriately
  const [selectedRef, bounds] = useMeasure({
    offsetSize: true,
    polyfill: ResizeObserver
  })

  useEffect(() => {
    let selectedRefIdx = props.options.findIndex(
      (option) => option.key === selectedOption
    )
    if (selectedRefIdx === -1) {
      selectedRefIdx = 0
    }

    const optionRef = optionRefs.current[selectedRefIdx].current

    if (optionRef) {
      const { clientWidth: width, offsetLeft: left } = optionRef
      setAnimatedProps({
        to: { left: `${left}px`, width: `${width}px` },
        immediate: bounds !== lastBounds.current // Don't animate on moves/resizes
      })
      lastBounds.current = bounds
    }
  }, [
    props.options,
    selectedOption,
    props.selected,
    setAnimatedProps,
    selected,
    optionRefs,
    bounds
  ])

  return (
    <div
      className={cn(styles.tabs, props.className, {
        [styles.containerFullWidth]: !!props.fullWidth,
        [styles.isMobile]: props.isMobile
      })}
    >
      <animated.div
        className={styles.tabBackground}
        style={animatedProps}
        role='radiogroup'
        aria-label={props.label}
      />
      {props.options.map((option, idx) => {
        return (
          <Fragment key={option.key}>
            <label
              ref={
                option.key === selectedOption
                  ? mergeRefs([optionRefs.current[idx], selectedRef])
                  : optionRefs.current[idx]
              }
              className={cn(styles.tab, {
                [styles.tabFullWidth]: !!props.fullWidth
              })}
            >
              <input
                type='radio'
                checked={option.key === selectedOption}
                onChange={(e) => {
                  onSetSelected(option.key)
                }}
              />
              {option.text}
            </label>
            <div
              className={cn(styles.separator, {
                [styles.invisible]:
                  // Hide separator right of the selected option
                  selectedOption === option.key ||
                  // Hide separator right of the last option
                  idx === props.options.length - 1 ||
                  // Hide separator right of an option if the next one is selected
                  selectedOption === props.options[idx + 1].key
              })}
            />
          </Fragment>
        )
      })}
    </div>
  )
}

type SliderOption = {
  key: any
  text: string
}

type TabSliderProps = {
  fullWidth?: boolean
  className?: string
  label?: string
  selected?: any
  onSelectOption?: (selected: any) => void
  options: SliderOption[]
  isMobile?: boolean
}

export default TabSlider
