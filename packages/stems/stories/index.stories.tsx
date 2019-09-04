import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs } from '@storybook/addon-knobs'
import { withSmartKnobs } from 'storybook-addon-smart-knobs'
import { host } from 'storybook-host'

import '../src/assets/styles/colors.css'
import '../src/assets/styles/fonts.css'
import '../src/assets/styles/sizes.css'
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
      uniqueId='1'
      isPlaying={false}
      isDisabled={false}
      includeTimestamps
      elapsedSeconds={0}
      totalSeconds={100}
    />
  )
