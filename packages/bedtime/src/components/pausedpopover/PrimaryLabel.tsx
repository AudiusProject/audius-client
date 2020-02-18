import { h } from 'preact'

import styles from './PrimaryLabel.module.css'

const messages = {
  label: 'Looking for more like this?'
}

const PrimaryLabel = () => {
  return (
    <div className={styles.container}>
      {messages.label}
    </div>
  )
}

export default PrimaryLabel
