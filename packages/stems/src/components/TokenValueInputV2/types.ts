import React, { ComponentPropsWithoutRef, ReactNode } from 'react'

import BN from 'bn.js'

type TokenValueInputV2BaseProps = {
  label?: ReactNode
  labelClassName?: string
  className?: string
  inputClassName?: string
  inputRef?: React.RefObject<HTMLInputElement>
  tokenLabel?: string
  tokenLabelClassName?: string
  placeholder?: string
  decimals?: number
  isWhole?: boolean
  value?: string
  onChange?: (value: string, valueBN: BN) => void
} & Omit<ComponentPropsWithoutRef<'input'>, 'onChange'>

type TokenValueInputV2PropsWithLabel = TokenValueInputV2BaseProps & {
  label: string
}
type TokenValueInputV2PropsWithAriaLabel = TokenValueInputV2BaseProps & {
  ['aria-label']: string
}

export type TokenValueInputV2Props =
  | TokenValueInputV2PropsWithLabel
  | TokenValueInputV2PropsWithAriaLabel
