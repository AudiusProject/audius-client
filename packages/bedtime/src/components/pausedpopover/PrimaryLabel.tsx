import cn from 'classnames'
import { h } from 'preact'

import styles from './PrimaryLabel.module.css'

const messages = {
  label: 'Looking for more like this?'
}

interface PrimaryLabelProps {
  className?: string
}

const PrimaryLabel = ({
  className
}: PrimaryLabelProps) => {
  return (
    <div className={cn(styles.container, className)}>
      {messages.label}
    </div>
  )
}

export default PrimaryLabel
