import cn from 'classnames'

import { ReactComponent as IconPause } from 'assets/img/pbIconPause.svg'
import { ReactComponent as IconPlay } from 'assets/img/pbIconPlay.svg'

import styles from './TablePlayButton.module.css'

type TablePlayButtonProps = {
  className?: string
  hideDefault?: boolean
  onClick?: (e: any) => void
  paused?: boolean
  playing?: boolean
}

export const TablePlayButton = ({
  className,
  hideDefault = true,
  onClick,
  paused,
  playing = false
}: TablePlayButtonProps) => {
  return (
    <div onClick={onClick} className={cn(styles.tablePlayButton, className)}>
      {playing && !paused ? (
        <div>
          <IconPause className={styles.icon} />
        </div>
      ) : (
        <div>
          <IconPlay
            className={cn(styles.icon, {
              [styles.hideDefault]: hideDefault && !playing
            })}
          />
        </div>
      )}
    </div>
  )
}
