import { Story } from '@storybook/react'

import * as Icons from 'components/Icons'

import { HarmonyButton } from './HarmonyButton'
import {
  HarmonyButtonProps,
  HarmonyButtonSize,
  HarmonyButtonType
} from './types'

export default {
  component: HarmonyButton,
  title: 'Components/HarmonyButton',
  argTypes: { onClick: { action: 'clicked' } }
}

const baseProps: HarmonyButtonProps = {
  leftIcon: <Icons.IconPlay />,
  text: 'Click Me'
}

const Template: Story<HarmonyButtonProps> = (args) => (
  <div style={{ alignItems: 'center', display: 'flex', gap: '16px' }}>
    <HarmonyButton {...baseProps} size={HarmonyButtonSize.SMALL} {...args} />
    <HarmonyButton {...baseProps} size={HarmonyButtonSize.DEFAULT} {...args} />
    <HarmonyButton {...baseProps} size={HarmonyButtonSize.LARGE} {...args} />
  </div>
)

// TODO: disabled state for all variants

// Default
export const Default = Template.bind({})

// Default w/ color
export const DefaultWithColor = Template.bind({})
DefaultWithColor.args = { color: 'accentBlue' }

// Secondary
export const Secondary = Template.bind({})
Secondary.args = { variant: HarmonyButtonType.SECONDARY }

// Tertiary
export const Tertiary = Template.bind({})
Tertiary.args = { variant: HarmonyButtonType.TERTIARY }

// Destructive
export const Destructive = Template.bind({})
Destructive.args = { variant: HarmonyButtonType.DESTRUCTIVE }

// Ghost
export const Ghost = Template.bind({})
Ghost.args = { variant: HarmonyButtonType.GHOST }
