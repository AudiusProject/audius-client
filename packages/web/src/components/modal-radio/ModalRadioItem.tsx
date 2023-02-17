import { ReactNode } from 'react'

import { RadioButton } from '@audius/stems'
import cn from 'classnames'

import styles from './ModalRadioItem.module.css'

type ModalRadioItemProps = {
  label: string
  title?: ReactNode
  description: ReactNode
  value: any
  disabled?: boolean
  icon?: ReactNode
  checkedContent?: ReactNode
}

export const ModalRadioItem = (props: ModalRadioItemProps) => {
  const { icon, label, title, description, value, disabled, checkedContent } =
    props
  return (
    <label className={cn(styles.root)}>
      <RadioButton
        className={styles.radio}
        inputClassName={styles.input}
        aria-label={label}
        value={value}
        disabled={disabled}
      />
      <div className={styles.labelContent}>
        <div className={styles.optionTitle}>
          {icon}
          <span>{title ?? label}</span>
        </div>
        <div className={styles.optionDescription}>{description}</div>
        {checkedContent ? (
          <div className={styles.checkedContent}>{checkedContent}</div>
        ) : null}
      </div>
    </label>
  )
}
