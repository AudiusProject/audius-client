export enum Format {
  INPUT,
  TEXTAREA
}

export type TokenValueInputProps = {
  className?: string
  labelClassName?: string
  inputClassName?: string
  rightLabelClassName?: string
  label?: string
  type?: string
  format?: Format
  placeholder?: string
  rightLabel?: string
  value?: string
  isNumeric?: boolean
  onChange?: (text: string) => void
}
