import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs } from '@storybook/addon-knobs'
import { withSmartKnobs } from 'storybook-addon-smart-knobs'
import { host } from 'storybook-host'

import '../src/index.css'
import Scrubber from '../src/Scrubber'

storiesOf('Stems', module)
  .addDecorator(withSmartKnobs)
  .addDecorator(withKnobs)
  .addDecorator(
    host({
      align: 'center bottom',
      height: '80%',
      width: 800
    })
  )
  .add('Scrubber', () =>
    <Scrubber
      isPlaying={false}
      isDisabled={false}
      elapsedSeconds={20}
      totalSeconds={100}
    />
  )
