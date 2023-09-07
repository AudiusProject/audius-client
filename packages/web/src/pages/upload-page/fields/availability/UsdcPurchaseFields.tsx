import {
  ChangeEventHandler,
  FocusEventHandler,
  useCallback,
  useState
} from 'react'

import cn from 'classnames'
import { useField } from 'formik'

import { TextField, TextFieldProps } from 'components/form-fields'
import layoutStyles from 'components/layout/layout.module.css'
import { Text } from 'components/typography'
import {
  PRECISION,
  onTokenInputBlur,
  onTokenInputChange
} from 'utils/tokenInput'

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

  return (
    <div className={cn(layoutStyles.col, layoutStyles.gap4)}>
      <PriceField disabled={disabled} />
      <PreviewField disabled={disabled} />
    </div>
  )
}

const PreviewField = (props: TrackAvailabilityFieldsProps) => {
  const { disabled } = props
  const [{ value }, , { setValue: setPreview }] = useField<number>(PREVIEW)
  const [humanizedValue, setHumanizedValue] = useState<string | undefined>(
    value?.toString()
  )

  const handlePreviewChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const input = e.target.value.replace(/[^0-9]+/g, '')
      setHumanizedValue(input)
      setPreview(Number(input))
    },
    [setPreview]
  )

  return (
    <BoxedTextField
      {...messages.preview}
      name={PREVIEW}
      label={messages.preview.placeholder}
      value={humanizedValue}
      placeholder={messages.preview.placeholder}
      endAdornment={messages.seconds}
      onChange={handlePreviewChange}
      disabled={disabled}
    />
  )
}

const PriceField = (props: TrackAvailabilityFieldsProps) => {
  const { disabled } = props
  const [{ value }, , { setValue: setPrice }] = useField<number>(PRICE)
  const [humanizedValue, setHumanizedValue] = useState(
    value ? (value / 100).toFixed(PRECISION) : null
  )

  const handlePriceChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const { human, value } = onTokenInputChange(e)
      setHumanizedValue(human)
      setPrice(value)
    },
    [setPrice, setHumanizedValue]
  )

  const handlePriceBlur: FocusEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setHumanizedValue(onTokenInputBlur(e))
    },
    []
  )

  return (
    <BoxedTextField
      {...messages.price}
      name={PRICE}
      label={messages.price.label}
      value={humanizedValue ?? undefined}
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
        <Text>{description}</Text>
      </div>
      <TextField inputRootClassName={styles.inputRoot} {...inputProps} />
    </div>
  )
}
