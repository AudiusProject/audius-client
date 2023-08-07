import { PropsWithChildren } from 'react'

import { TokenAmountInput } from '@audius/stems'
import cn from 'classnames'
import { useField } from 'formik'

import { TextField } from 'components/form-fields'
import layoutStyles from 'components/layout/layout.module.css'
import { Text } from 'components/typography'

import { PREMIUM_CONDITIONS } from '../../forms/TrackAvailabilityModalForm'

import styles from './UsdcPurchaseFields.module.css'

const messages = {
  price: {
    title: 'Set a Price',
    description:
      'Set the price fans must pay to unlock this track (minimum price of $0.99)'
  },
  preview: {
    title: '15 Second Preview',
    description:
      'A 15 second preview will be generated. Specify a starting timestamp below.'
  }
}

export enum UsdcPurchaseType {
  TIP = 'tip',
  FOLLOW = 'follow'
}

type TrackAvailabilityFieldsProps = {
  disabled?: boolean
}

const PRICE = `${PREMIUM_CONDITIONS}.usdc_purchase.price`
const PREVIEW = `${PREMIUM_CONDITIONS}.usdc_purchase.slot`

export const UsdcPurchaseFields = (props: TrackAvailabilityFieldsProps) => {
  const [priceField] = useField(PRICE)
  return (
    <div className={cn(layoutStyles.col)}>
      <BoxedInput {...messages.price}>
        <TextField name={PRICE} />
        <TokenAmountInput aria-label='price' {...priceField} />
      </BoxedInput>
      <BoxedInput {...messages.preview}>
        <TextField name={PREVIEW} />
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
