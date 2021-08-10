import React, { useState, useEffect } from 'react'

import cn from 'classnames'

import styles from './ProgressBar.module.css'

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

export type ProgressBarProps = {
  className?: string
  sliderClassName?: string
  sliderBarClassName?: string
  min?: number
  max?: number
  value: number
  showLabels?: boolean
  minWrapper?: React.ComponentType<{ value: number }>
  maxWrapper?: React.ComponentType<{ value: number }>
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  className,
  sliderClassName,
  sliderBarClassName,
  min = 0,
  max = 1,
  value,
  showLabels = false,
  minWrapper: MinWrapper,
  maxWrapper: MaxWrapper
}: ProgressBarProps) => {
  const [sliderWidth, setSliderWidth] = useState(0)

  useEffect(() => {
    const percentage = (clamp(value - min, 0, max) * 100) / (max - min)
    setSliderWidth(percentage)
  }, [value, max, min])

  return (
    <div className={cn(styles.container, { [className!]: !!className })}>
      <div
        className={cn(styles.slider, { [sliderClassName!]: !!sliderClassName })}
      >
        <div
          className={cn(styles.sliderBar, {
            [sliderBarClassName!]: !!sliderBarClassName
          })}
          style={{ width: `${sliderWidth}%` }}
        ></div>
      </div>
      {showLabels && (
        <div className={styles.labels}>
          <div className={styles.minLabel}>
            {MinWrapper ? <MinWrapper value={min} /> : min}
          </div>
          <div className={styles.maxLabel}>
            {MaxWrapper ? <MaxWrapper value={max} /> : max}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProgressBar
