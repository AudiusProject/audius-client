import { useRef, useState } from 'react'

import { Story } from '@storybook/react'
import BN from 'bn.js'

import { TokenValueInputV2 } from './TokenValueInputV2'
import { TokenValueInputV2Props } from './types'

export default {
  component: TokenValueInputV2,
  title: 'Components/TokenValueInputV2'
}

const ControlledTemplate: Story<TokenValueInputV2Props> = (args) => {
  const [value, setValue] = useState<string>('')
  const [, setValueBN] = useState<BN | undefined>(new BN(0))
  const ref = useRef<HTMLInputElement>(null)
  return (
    <TokenValueInputV2
      {...args}
      value={value}
      inputRef={ref}
      onChange={(value, valueBN) => {
        setValue(value)
        setValueBN(valueBN)
        console.log({ value, valueBN: valueBN.toString() })
      }}
    />
  )
}

const UncontrolledTemplate: Story<TokenValueInputV2Props> = (args) => (
  <TokenValueInputV2 {...args} />
)

export const Default = ControlledTemplate.bind({})
Default.args = {
  'aria-label': 'Amount to Send',
  placeholder: 'Enter an amount',
  tokenLabel: '$AUDIO',
  decimals: 8,
  isWhole: true
}

export const Uncontrolled = UncontrolledTemplate.bind({})
Uncontrolled.args = {
  label: 'Amount to Send',
  placeholder: '0',
  tokenLabel: '$AUDIO',
  decimals: 8
}
