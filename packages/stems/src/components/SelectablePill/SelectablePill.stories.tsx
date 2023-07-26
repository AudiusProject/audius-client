import { useState } from 'react'

import { Story } from '@storybook/react'

import { IconHeart } from 'components/Icons'

import { SelectablePill } from './SelectablePill'
import { SelectablePillProps } from './types'

export default {
  component: SelectablePill,
  title: 'Components/SelectablePill'
}

const Template: Story<SelectablePillProps> = ({ ...args }) => {
  const [isSelected, setIsSelected] = useState(false)
  return (
    <SelectablePill
      onClick={() => setIsSelected(!isSelected)}
      {...args}
      isSelected={args.isSelected === undefined ? isSelected : args.isSelected}
    />
  )
}

const baseProps: Partial<SelectablePillProps> = {
  size: 'default',
  label: 'Label'
}

// Default
export const Primary = Template.bind({})
Primary.args = { ...baseProps }

// Large
export const Large = Template.bind({})
Large.args = { size: 'large', ...baseProps }

// Icon
export const WithIcon = Template.bind({})
WithIcon.args = { ...baseProps, icon: IconHeart }

// Icon - large
export const LargeWithIcon = Template.bind({})
LargeWithIcon.args = { ...baseProps, size: 'large', icon: IconHeart }
