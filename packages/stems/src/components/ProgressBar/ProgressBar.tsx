import { useState, useEffect, useMemo } from 'react'
import * as React from 'react'

import BN from 'bn.js'
import cn from 'classnames'

import { clampBN } from 'utils/bnHelpers'

import styles from './ProgressBar.module.css'
import { ProgressBarProps, ProgressValue } from './types'

const getBN = (num: ProgressValue): BN => {
  if (num instanceof BN) return num
  return new BN(num)
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  className,
  sliderClassName,
  sliderBarClassName,
  min = new BN(0),
  max = new BN(100),
  value,
  showLabels = false,
  minWrapper: MinWrapper,
  maxWrapper: MaxWrapper
}: ProgressBarProps) => {
  const [sliderWidth, setSliderWidth] = useState(0)

  const percentage = useMemo(() => {
    const minBN = getBN(min)
    const maxBN = getBN(max)
    const valBN = getBN(value)

    return clampBN(valBN.sub(minBN), new BN(0), maxBN)
      .mul(new BN(100))
      .div(maxBN.sub(minBN))
  }, [max, min, value])

  useEffect(() => {
    setSliderWidth(percentage.toNumber())
  }, [percentage])

  return (
    <div
      className={cn(styles.container, { [className!]: !!className })}
      role='progressbar'
      aria-valuenow={percentage.toNumber()}
    >
      <div
        className={cn(styles.slider, {
          [sliderClassName!]: !!sliderClassName
        })}
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
