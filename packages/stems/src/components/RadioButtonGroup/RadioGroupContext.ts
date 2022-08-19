import { createContext } from 'react'

export type RadioGroupContextValue = {
  name?: string
  value?: any
  onChange: (value: string) => void
}

export const RadioGroupContext = createContext<
  RadioGroupContextValue | undefined
>(undefined)
