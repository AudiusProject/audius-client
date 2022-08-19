import { Story } from '@storybook/react'

import { RadioPillButton } from 'components/RadioPillButton'

import { RadioButtonGroup, RadioButtonGroupProps } from '.'

export default {
  component: RadioButtonGroup,
  title: 'Components/RadioButtonGroup'
}

const defaultProps: RadioButtonGroupProps = {
  name: 'Test',
  onChange: (value) => {
    console.log(value)
  }
}

const Template: Story<RadioButtonGroupProps> = (args) => {
  return (
    <>
      <RadioButtonGroup {...defaultProps} {...args}>
        <RadioPillButton label='5' value={5} />
        <RadioPillButton label='10' value={10} />
      </RadioButtonGroup>
      <div>
        <input type='radio' value='1' name='foo' />
        <input type='radio' value='2' name='foo' />
        <input type='radio' value='3' name='foo' />
      </div>
    </>
  )
}

// Default
export const Default = Template.bind({})
