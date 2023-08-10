import { ChangeEventHandler, PropsWithChildren, useCallback } from 'react'

import cn from 'classnames'
import { useField } from 'formik'

import { InputV2Variant } from 'components/data-entry/InputV2'
import { TextField } from 'components/form-fields'
import layoutStyles from 'components/layout/layout.module.css'
import { Text } from 'components/typography'

import { PREVIEW, PRICE } from '../AccessAndSaleField'

import styles from './UsdcPurchaseFields.module.css'

const messages = {
  price: {
    title: 'Set a Price',
    description:
      'Set the price fans must pay to unlock this track (minimum price of $0.99)',
    label: 'Cost to Unlock',
    placeholder: '0.99'
  },
  preview: {
    title: '15 Second Preview',
    description:
      'A 15 second preview will be generated. Specify a starting timestamp below.',
    placeholder: 'Start Time'
  },
  dollars: '$',
  usdc: '(USDC)',
  seconds: 'Seconds'
}

export enum UsdcPurchaseType {
  TIP = 'tip',
  FOLLOW = 'follow'
}

type TrackAvailabilityFieldsProps = {
  disabled?: boolean
}

export const UsdcPurchaseFields = (props: TrackAvailabilityFieldsProps) => {
  const { disabled } = props
  const [, , { setValue: setPrice }] = useField(PRICE)

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const precision = 2
      const input = e.target.value.replace(/[^0-9.]+/g, '')
      // Regex to grab the whole and decimal parts of the number, stripping duplicate '.' characters
      const match = input.match(/^(?<whole>\d*)(?<dot>.)?(?<decimal>\d*)/)
      const { whole, decimal, dot } = match?.groups || {}

      // Conditionally render the decimal part, and only for the number of decimals specified
      const stringAmount = dot
        ? `${whole}.${decimal.substring(0, precision)}`
        : whole
      setPrice(stringAmount)
    },
    [setPrice]
  )

  return (
    <div className={cn(layoutStyles.col, layoutStyles.gap4)}>
      <BoxedInput {...messages.price}>
        <TextField
          variant={InputV2Variant.ELEVATED_PLACEHOLDER}
          name={PRICE}
          label={messages.price.label}
          placeholder={messages.price.placeholder}
          prefix={messages.dollars}
          suffix={messages.usdc}
          onChange={handleChange}
          disabled={disabled}
        />
      </BoxedInput>
      <BoxedInput {...messages.preview}>
        <TextField
          variant={InputV2Variant.ELEVATED_PLACEHOLDER}
          name={PREVIEW}
          label={messages.preview.placeholder}
          placeholder={messages.preview.placeholder}
          suffix={messages.seconds}
          disabled={disabled}
        />
      </BoxedInput>
    </div>
  )
}

type BoxedInputProps = PropsWithChildren<{
  title: string
  description: string
}>

const BoxedInput = (props: BoxedInputProps) => {
  const { title, description, children } = props
  return (
    <div
      className={cn(styles.inputContainer, layoutStyles.col, layoutStyles.gap4)}
    >
      <div className={cn(layoutStyles.col, layoutStyles.gap2)}>
        <Text variant='title'>{title}</Text>
        <Text variant='body'>{description}</Text>
      </div>
      {children}
    </div>
  )
}
