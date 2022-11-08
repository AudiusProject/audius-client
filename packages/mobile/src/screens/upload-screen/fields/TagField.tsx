import { useField } from 'formik'

import { TagInput, Text } from 'app/components/core'
import { TrackMetadata } from '@audius/common'

const messages = {
  placeholder: 'New Tag'
}

export const TagField = () => {
  const name = 'tags'
  const [{ value, onChange, onBlur }] = useField<TrackMetadata['tags']>(name)

  const tagCount = value?.split(',').length ?? 0
  const tagCountColor =
    tagCount < 8 ? 'neutralLight4' : tagCount < 9 ? 'warning' : 'error'

  return (
    <TagInput
      value={value ?? ''}
      endAdornment={
        <Text variant='body' color={tagCountColor}>
          {tagCount}/10
        </Text>
      }
      onChangeText={onChange(name)}
      onBlur={onBlur(name)}
      placeholder={messages.placeholder}
    />
  )
}
