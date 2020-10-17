import { TokenValueSlider } from '@audius/stems'
import BN from 'bn.js'
import React from 'react'
import { BNAudio } from 'store/wallet/slice'
import { formatNumberCommas } from 'utils/formatUtil'

import styles from './DashboardTokenValueSlider.module.css'

type DashboardTokenValueSliderProps = {
  min: BNAudio
  max: BNAudio
  value: BNAudio
}

const MinMaxWrapper = ({ value }: { value: BN }) => {
  return (
    <div className={styles.minMaxWrapper}>{`${formatNumberCommas(
      value.toString()
    )} $AUDIO`}</div>
  )
}

const DashboardTokenValueSlider = ({
  min,
  max,
  value
}: DashboardTokenValueSliderProps) => {
  return (
    <TokenValueSlider
      className={styles.sliderContainer}
      sliderClassName={styles.slider}
      sliderBarClassName={styles.sliderBar}
      min={min}
      max={max}
      value={value}
      minSliderWidth={4}
      isIncrease={true}
      minWrapper={MinMaxWrapper}
      maxWrapper={MinMaxWrapper}
    />
  )
}

export default DashboardTokenValueSlider
