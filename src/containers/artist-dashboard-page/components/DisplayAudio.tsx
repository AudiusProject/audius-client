import React from 'react'
import { BNWei, weiToAudioString } from 'store/wallet/slice'
import Tooltip from 'components/tooltip/Tooltip'
import styles from './DisplayAudio.module.css'
import cn from 'classnames'
import { formatWei } from 'utils/formatUtil'

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
        <span className={styles.amount}>{weiToAudioString(amount)}</span>
      </Tooltip>
      <span className={styles.label}>{messages.currency}</span>
    </div>
  )
}

export default DisplayAudio
