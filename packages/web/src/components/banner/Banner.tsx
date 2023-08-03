import cn from 'classnames'

import { ReactComponent as IconRemove } from 'assets/img/iconRemove.svg'

import styles from './Banner.module.css'

export type BannerProps = {
  className?: string
  onClose: () => void
  isElectron?: boolean
  isMobile?: boolean
  children: React.ReactNode
}

export const Banner = (props: BannerProps) => {
  return (
    <div
      className={cn(
        styles.banner,
        {
          [styles.isElectron]: props.isElectron,
          [styles.isMobile]: props.isMobile
        },
        props.className
      )}
    >
      <IconRemove className={styles.iconRemove} onClick={props.onClose} />
      {props.children}
    </div>
  )
}
