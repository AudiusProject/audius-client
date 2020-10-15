import { TokenValueSlider } from '@audius/stems'
import BN from 'bn.js'
import React from 'react'
import { BNAudio } from 'store/wallet/slice'

import styles from './DashboardTokenValueInput.module.css'

type DashboardTokenValueInputProps = {
  min: BNAudio
  max: BNAudio
  value: BNAudio
}

const MinMaxWrapper = ({ value }: { value: BN }) => {
  return <div className={styles.minMaxWrapper}>{`${value} $AUDIO`}</div>
}

const DashboardTokenValueInput = ({
  min,
  max,
  value
}: DashboardTokenValueInputProps) => {
  return (
    <TokenValueSlider
      className={styles.sliderContainer}
      sliderClassName={styles.slider}
      min={min}
      max={max}
      value={value}
      minSliderWidth={4} // ?: number
      isIncrease={true} // ?: boolean
      minWrapper={MinMaxWrapper}
      maxWrapper={MinMaxWrapper}
    />
  )
}

export default DashboardTokenValueInput
