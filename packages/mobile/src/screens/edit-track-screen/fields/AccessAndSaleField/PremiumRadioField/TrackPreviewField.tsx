import { useField } from 'formik'

import { Text } from 'app/components/core'

import { BoxedTextField } from './BoxedTextField'

const TRACK_PREVIEW = 'preview_start_seconds'

const messages = {
  title: '15 Second Preview',
  description:
    'A 15 second preview will be generated. Specify a starting timestamp below.',
  label: 'Start Time',
  placeholder: 'Start Time',
  seconds: 'Seconds'
}

export const TrackPreviewField = () => {
  const [{ value }] = useField(TRACK_PREVIEW)
  return (
    <BoxedTextField
      title={messages.title}
      description={messages.description}
      name={TRACK_PREVIEW}
      value={String(value)}
      keyboardType='number-pad'
      label={messages.label}
      endAdornment={<Text>{messages.seconds}</Text>}
    />
  )
}
