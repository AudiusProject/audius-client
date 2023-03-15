import {
  ChangeEventHandler,
  ComponentPropsWithoutRef,
  useCallback,
  useContext
} from 'react'

import cn from 'classnames'

import { RadioGroupContext } from 'components/RadioButtonGroup'

import styles from './RadioButton.module.css'

export type RadioButtonProps = ComponentPropsWithoutRef<'input'> & {
  inputClassName?: string
}

export const RadioButton = (props: RadioButtonProps) => {
  const {
    className,
    inputClassName,
    onChange,
    name: nameProp,
    checked: checkedProp,
    ...other
  } = props

  const radioGroup = useContext(RadioGroupContext)
  let name = nameProp
  let checked = checkedProp
  if (radioGroup) {
    if (typeof name === 'undefined') {
      name = radioGroup.name
    }
    if (typeof checked === 'undefined') {
      checked = String(props.value) === String(radioGroup.value)
    }
  }

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      onChange?.(e)
      radioGroup?.onChange?.(e)
    },
    [onChange, radioGroup]
  )

  return (
    <div className={cn(styles.root, className)}>
      <input
        className={cn(styles.input, inputClassName, { [styles.checkedAndDisabled]: checked && props.disabled })}
        name={name}
        checked={checked}
        type='radio'
        onChange={handleChange}
        {...other}
      />
    </div>
  )
}
