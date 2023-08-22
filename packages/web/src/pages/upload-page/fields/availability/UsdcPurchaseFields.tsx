import { ChangeEventHandler, FocusEventHandler, useCallback } from 'react'

import cn from 'classnames'
import { useField } from 'formik'

import { TextField, TextFieldProps } from 'components/form-fields'
import layoutStyles from 'components/layout/layout.module.css'
import { Text } from 'components/typography'

import { PREVIEW, PRICE_HUMANIZED } from '../AccessAndSaleField'

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

const PRECISION = 2

type TrackAvailabilityFieldsProps = {
  disabled?: boolean
}

export const UsdcPurchaseFields = (props: TrackAvailabilityFieldsProps) => {
  const { disabled } = props

  return (
    <div className={cn(layoutStyles.col, layoutStyles.gap4)}>
      <PriceField disabled={disabled} />
      <BoxedTextField
        {...messages.preview}
        name={PREVIEW}
        label={messages.preview.placeholder}
        placeholder={messages.preview.placeholder}
        endAdornment={messages.seconds}
        disabled={disabled}
      />
    </div>
  )
}

const PriceField = (props: TrackAvailabilityFieldsProps) => {
  const { disabled } = props
  const [, , { setValue: setPrice }] = useField(PRICE_HUMANIZED)

  const handlePriceChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const input = e.target.value.replace(/[^0-9.]+/g, '')
      // Regex to grab the whole and decimal parts of the number, stripping duplicate '.' characters
      const match = input.match(/^(?<whole>\d*)(?<dot>.)?(?<decimal>\d*)/)
      const { whole, decimal, dot } = match?.groups || {}

      // Conditionally render the decimal part, and only for the number of decimals specified
      const stringAmount = dot
        ? `${whole}.${decimal.substring(0, PRECISION)}`
        : whole
      setPrice(stringAmount)
    },
    [setPrice]
  )

  const handlePriceBlur: FocusEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const precision = 2
      const [whole, decimal] = e.target.value.split('.')

      const paddedDecimal = decimal
        .substring(0, precision)
        .padEnd(precision, '0')
      setPrice(`${whole}.${paddedDecimal}`)
    },
    [setPrice]
  )

  return (
    <BoxedTextField
      {...messages.price}
      name={PRICE_HUMANIZED}
      label={messages.price.label}
      placeholder={messages.price.placeholder}
      startAdornment={messages.dollars}
      endAdornment={messages.usdc}
      onChange={handlePriceChange}
      onBlur={handlePriceBlur}
      disabled={disabled}
    />
  )
}

type BoxedTextFieldProps = {
  title: string
  description: string
} & TextFieldProps

const BoxedTextField = (props: BoxedTextFieldProps) => {
  const { title, description, ...inputProps } = props
  return (
    <div
      className={cn(styles.inputContainer, layoutStyles.col, layoutStyles.gap4)}
    >
      <div className={cn(layoutStyles.col, layoutStyles.gap2)}>
        <Text variant='title'>{title}</Text>
        <Text variant='body'>{description}</Text>
      </div>
      <TextField {...inputProps} />
    </div>
  )
}
