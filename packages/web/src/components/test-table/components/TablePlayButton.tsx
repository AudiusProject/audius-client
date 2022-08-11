import cn from 'classnames'

import { ReactComponent as IconPause } from 'assets/img/pbIconPause.svg'
import { ReactComponent as IconPlay } from 'assets/img/pbIconPlay.svg'

import styles from './TablePlayButton.module.css'

type TablePlayButtonProps = {
  className?: string
  paused?: boolean
  playing?: boolean
  onClick?: (e: MouseEvent) => void
  hideDefault?: boolean
}

export const TablePlayButton = ({
  paused,
  playing = false,
  onClick,
  hideDefault = true,
  className
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
