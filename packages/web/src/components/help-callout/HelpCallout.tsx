import cn from 'classnames'

import { ReactComponent as IconQuestionCircle } from 'assets/img/iconQuestionCircle.svg'

import styles from './HelpCallout.module.css'
import { ReactNode } from 'react'

export const HelpCallout = ({
  content,
  className
}: {
  content: ReactNode
  className?: string
}) => {
  return (
    <div className={cn(styles.root, className)}>
      <IconQuestionCircle className={styles.icon} />
      <div className={styles.content}>{content}</div>
    </div>
  )
}
