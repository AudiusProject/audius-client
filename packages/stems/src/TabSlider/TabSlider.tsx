import React, { useState, useEffect, useRef, useCallback } from 'react'
import cn from 'classnames'
import { useSpring, animated } from 'react-spring'

import styles from './TabSlider.module.css'
import { TabSliderProps } from './types'

// Note, offset is the inner padding of the container div
const OFFSET = 3

const TabSlider = (props: TabSliderProps) => {
  const optionRefs = useRef<Array<React.MutableRefObject<HTMLElement>>>(
    props.options.map(() => React.createRef())
  )
  const [selected, setSelected] = useState(props.options[0].key)

  const selectedOption = props.selected || selected

  const onSetSelected = (option: string) => {
    // Call props function if controlled
    if (props.onSelectOption) props.onSelectOption(option)
    setSelected(option)
  }

  const [animatedProps, setAnimatedProps] = useSpring(() => ({
    to: { left: '0px', width: '0px' }
  }))

  useEffect(() => {
    const selectedRefIdx = props.options.findIndex(
      option => option.key === selectedOption
    )
    const selectedRef = optionRefs.current[selectedRefIdx]
    const left = optionRefs.current
      .slice(0, selectedRefIdx)
      .reduce((totalWidth, ref) => totalWidth + ref.current.clientWidth, OFFSET)
    const width = selectedRef.current.clientWidth

    setAnimatedProps({ to: { left: `${left}px`, width: `${width}px` } })
  }, [
    props.options,
    selectedOption,
    props.selected,
    setAnimatedProps,
    selected,
    optionRefs
  ])

  const getFirstOptionRef = useCallback(
    node => {
      if (node !== null) {
        setAnimatedProps({
          to: {
            left: `${OFFSET}px`,
            width: `${node.clientWidth}px`
          }
        })
        optionRefs.current[0].current = node
      }
    },
    [setAnimatedProps]
  )

  const setRefObject = useCallback(
    (index: number) => (node: null | HTMLElement) => {
      if (node !== null) {
        optionRefs.current[index].current = node
      }
    },
    []
  )

  return (
    <div
      className={cn(styles.tabs, props.className, {
        [styles.containerFullWidth]: !!props.fullWidth,
        [styles.isMobile]: props.isMobile
      })}
    >
      <animated.div className={styles.tabBackground} style={animatedProps} />
      {props.options.map((option, idx) => {
        const ref = idx === 0 ? getFirstOptionRef : setRefObject(idx) // optionRefs.current[idx]
        return (
          <React.Fragment key={option.key}>
            <div
              ref={ref}
              className={cn(
                styles.tab,
                {
                  [styles.activeTab]: selectedOption === option.key,
                  [styles.tabFullWidth]: !!props.fullWidth
                },
                props.textClassName,
                { [props.activeTextClassName]: selectedOption === option.key }
              )}
              onClick={() => onSetSelected(option.key)}
            >
              {option.text}
            </div>
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
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default TabSlider
