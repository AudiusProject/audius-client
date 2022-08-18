import { ComponentPropsWithoutRef, ReactNode } from 'react'

import cn from 'classnames'

import styles from './PillRadioButton.module.css'

type PillRadioButtonProps = ComponentPropsWithoutRef<'input'> & {
  inputClassName?: string
  children: ReactNode
}

export const PillRadioButton = (props: PillRadioButtonProps) => {
  const { className, inputClassName, children, ...inputProps } = props
  return (
    <label className={cn(styles.root, className)}>
      <input
        className={cn(styles.input, inputClassName)}
        {...inputProps}
        type='radio'
      />
      <span className={styles.labelText}>{children}</span>
    </label>
  )
}
