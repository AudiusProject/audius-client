import React from 'react'
import { storiesOf } from '@storybook/react'

import Input from 'components/data-entry/Input'
import LabeledInput from 'components/data-entry/LabeledInput'
import DropdownInput from 'components/data-entry/DropdownInput'
import TagInput from 'components/data-entry/TagInput'
import TextArea from 'components/data-entry/TextArea'
import DatePicker from 'components/data-entry/DatePicker'
import FormTile from 'components/data-entry/FormTile'
import InlineFormTile from 'components/data-entry/InlineFormTile'

export default () => {
  return storiesOf('DataEntry', module)
    .add('Input', () => {
      return <Input />
    })
    .add('LabeledInput', () => {
      return <LabeledInput />
    })
    .add('DropdownInput', () => {
      return <DropdownInput />
    })
    .add('TagInput', () => {
      return <TagInput />
    })
    .add('TextArea', () => {
      return <TextArea />
    })
    .add('DatePicker', () => {
      return <DatePicker />
    })
    .add('FormTile', () => {
      return <FormTile />
    })
    .add('InlineFormTile', () => {
      return <InlineFormTile />
    })
}
