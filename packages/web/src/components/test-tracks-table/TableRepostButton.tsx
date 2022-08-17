import cn from 'classnames'

import { ReactComponent as IconRepost } from 'assets/img/iconRepost.svg'
import Toast from 'components/toast/Toast'

import styles from './TableRepostButton.module.css'

const REPOST_TIMEOUT = 1000

type TableRepostButtonProps = {
  className?: string
  reposted?: boolean
  onClick?: (e: MouseEvent) => void
}

export const TableRepostButton = ({
  reposted,
  onClick,
  className
}: TableRepostButtonProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(styles.tableRepostButton, className, 'tableRepostButton')}
    >
      <Toast
        text={'Reposted!'}
        disabled={reposted}
        delay={REPOST_TIMEOUT}
        containerClassName={styles.iconContainer}
      >
        {reposted ? (
          <IconRepost className={cn(styles.icon, styles.reposted)} />
        ) : (
          <IconRepost className={cn(styles.icon, styles.notReposted)} />
        )}
      </Toast>
    </div>
  )
}
