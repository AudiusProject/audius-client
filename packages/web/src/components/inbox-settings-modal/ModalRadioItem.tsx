import { ReactNode } from 'react'

import { RadioButton } from '@audius/stems'

import styles from './ModalRadioItem.module.css'

type ModalRadioItemProps = {
  label: string
  title?: ReactNode
  description: ReactNode
  value: any
}

export const ModalRadioItem = (props: ModalRadioItemProps) => {
  const { label, title, description, value } = props
  return (
    <label className={styles.root}>
      <RadioButton className={styles.radio} aria-label={label} value={value} />
      <div className={styles.labelContent}>
        <div className={styles.optionTitle}>{title ?? label}</div>
        <div className={styles.optionDescription}>{description}</div>
      </div>
    </label>
  )
}
