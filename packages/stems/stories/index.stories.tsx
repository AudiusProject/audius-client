import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs } from '@storybook/addon-knobs'
import { withSmartKnobs } from 'storybook-addon-smart-knobs'
import { host } from 'storybook-host'

import '../src/assets/styles/colors.css'
import '../src/assets/styles/fonts.css'
import '../src/assets/styles/sizes.css'
import '../src/assets/styles/animations.css'
import Button from '../src/Button'
import Scrubber from '../src/Scrubber'
import { IconPlay } from '../src/Icons'

storiesOf('Stems', module)
  .addDecorator(withSmartKnobs())
  .addDecorator(withKnobs)
  .addDecorator(
    host({
      align: 'center bottom',
      height: '80%',
      width: 800
    })
  )
  .add('Button', () => <Button leftIcon={<IconPlay />} text='Click Me' />)
  .add('Scrubber', () => (
    <Scrubber mediaKey='1' elapsedSeconds={0} totalSeconds={100} />
  ))
