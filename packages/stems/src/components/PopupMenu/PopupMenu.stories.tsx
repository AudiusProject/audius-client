import React from 'react'

import { Story } from '@storybook/react'

import { Button } from 'components/Button'

import { PopupMenu } from './PopupMenu'
import { PopupMenuProps } from './types'
import { IconCamera, IconMail, IconPencil } from 'components/Icons'

export default {
  component: PopupMenu,
  title: 'Components/PopupMenu'
}

const Template: Story<PopupMenuProps> = args => {
  return (
    <>
      <PopupMenu
        {...args}
        renderTrigger={(
          anchorRef: React.MutableRefObject<any>,
          triggerPopup: () => void
        ) => {
          return (
            <Button text='Click me' ref={anchorRef} onClick={triggerPopup} />
          )
        }}
      />
    </>
  )
}

// Primary
export const Primary = Template.bind({})
const primaryProps: Omit<PopupMenuProps, 'renderTrigger'> = {
  items: [
    {
      text: 'Item 1',
      onClick: () => {}
    },
    {
      text: 'Item 2',
      onClick: () => {}
    },
    {
      text: 'Item 3',
      onClick: () => {}
    }
  ]
}

Primary.args = primaryProps

// WithIcons
export const WithIcons = Template.bind({})
const withIconsProps: Omit<PopupMenuProps, 'renderTrigger'> = {
  items: [
    {
      text: 'Item 1',
      icon: <IconCamera></IconCamera>,
      onClick: () => {}
    },
    {
      text: 'Item 2',
      icon: <IconMail></IconMail>,
      onClick: () => {}
    },
    {
      text: 'Item 3',
      icon: <IconPencil></IconPencil>,
      onClick: () => {}
    }
  ]
}

WithIcons.args = withIconsProps
