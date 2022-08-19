import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  ReactNode,
  useCallback,
  useState
} from 'react'

import { RadioGroupContext } from './'

export type RadioButtonGroupProps = {
  name: string
  onChange?: (e: ChangeEvent<HTMLInputElement>, value: string) => void
  children?: ReactNode
} & ComponentPropsWithoutRef<'div'>

export const RadioButtonGroup = (props: RadioButtonGroupProps) => {
  const { name, onChange, children, ...divProps } = props
  const [value, setValue] = useState()
  const handleChange = useCallback(
    (value) => {
      setValue(value)
      if (onChange) {
        onChange(value)
      }
    },
    [setValue, onChange]
  )
  return (
    <RadioGroupContext.Provider value={{ name, onChange: handleChange, value }}>
      <div {...divProps} role={'radiogroup'}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}
