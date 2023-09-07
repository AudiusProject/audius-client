import { ChangeEvent, FocusEvent } from 'react'

export const PRECISION = 2

export const onTokenInputChange = (e: ChangeEvent<HTMLInputElement>) => {
  const input = e.target.value.replace(/[^0-9.]+/g, '')
  // Regex to grab the whole and decimal parts of the number, stripping duplicate '.' characters
  const match = input.match(/^(?<whole>\d*)(?<dot>.)?(?<decimal>\d*)/)
  const { whole, decimal, dot } = match?.groups || {}

  // Conditionally render the decimal part, and only for the number of decimals specified
  const stringAmount = dot
    ? `${whole}.${(decimal ?? '').substring(0, PRECISION)}`
    : whole
  return { human: stringAmount, value: Number(stringAmount) * 100 }
}

export const onTokenInputBlur = (e: FocusEvent<HTMLInputElement>) => {
  const precision = 2
  const [whole, decimal] = e.target.value.split('.')

  const paddedDecimal = (decimal ?? '')
    .substring(0, precision)
    .padEnd(precision, '0')
  return `${whole.length > 0 ? whole : '0'}.${paddedDecimal}`
}
