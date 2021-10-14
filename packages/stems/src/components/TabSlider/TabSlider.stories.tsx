import React from 'react'

import { Story } from '@storybook/react'

import { TabSlider } from './TabSlider'
import { TabSliderProps, Option } from './types'

export default {
  component: TabSlider,
  title: 'Components/TabSlider',
  argTypes: {}
}

const Template: Story<TabSliderProps> = args => <TabSlider {...args} />

const options: Option[] = [
  {
    key: 'a',
    text: 'Long Option A'
  },
  {
    key: 'b',
    text: 'Option B'
  },
  {
    key: 'c',
    text: 'Really Long Option C'
  },
  {
    key: 'd',
    text: 'Option D'
  }
]

let selectedOption = ''

const handleOptionSelect = (key: string) => (selectedOption = key)

// Primary
export const Primary = Template.bind({})
const primaryProps: TabSliderProps = {
  options,
  selected: selectedOption,
  onSelectOption: handleOptionSelect
}

Primary.args = primaryProps
