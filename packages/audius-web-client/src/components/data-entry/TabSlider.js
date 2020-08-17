import React, { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'

import styles from './TabSlider.module.css'
import { useSpring, animated } from 'react-spring'

// Note, offset is the inner padding of the container div
const OFFSET = 3

const TabSlider = props => {
  const optionRefs = useRef(props.options.map(_ => React.createRef()))
  const [selected, setSelected] = useState(props.options[0].key)

  const selectedOption = props.selected || selected

  const onSetSelected = option => {
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

  return (
    <div
      className={cn(styles.tabs, props.className, {
        [styles.containerFullWidth]: !!props.fullWidth,
        [styles.isMobile]: props.isMobile
      })}
    >
      <animated.div className={styles.tabBackground} style={animatedProps} />
      {props.options.map((option, idx) => {
        return (
          <React.Fragment key={option.key}>
            <div
              ref={idx === 0 ? getFirstOptionRef : optionRefs.current[idx]}
              className={cn(styles.tab, {
                [styles.activeTab]: selectedOption === option.key,
                [styles.tabFullWidth]: !!props.fullWidth
              })}
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

TabSlider.propTypes = {
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  selected: PropTypes.any,
  onSelectOption: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.any,
      text: PropTypes.string
    })
  ).isRequired,
  isMobile: PropTypes.bool
}

export default TabSlider
