import React from 'react'
import { BNWei, formatWei } from 'store/wallet/slice'
import Tooltip from 'components/tooltip/Tooltip'
import styles from './DisplayAudio.module.css'
import cn from 'classnames'
import { formatAudio } from 'utils/formatUtil'

type DisplayAudioProps = {
  amount: BNWei
  className?: string
}

const messages = {
  currency: '$AUDIO'
}

const DisplayAudio = ({ amount, className }: DisplayAudioProps) => {
  return (
    <div className={cn({ [className!]: !!className })}>
      <Tooltip
        text={formatWei(amount)}
        className={styles.tooltip}
        placement={'top'}
        mount={'parent'}
        mouseEnterDelay={0.2}
      >
        <span className={styles.amount}>{formatAudio(amount)}</span>
      </Tooltip>
      <span className={styles.label}>{messages.currency}</span>
    </div>
  )
}

export default DisplayAudio
