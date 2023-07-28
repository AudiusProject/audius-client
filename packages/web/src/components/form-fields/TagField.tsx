import { useCallback } from 'react'

import { removeNullable } from '@audius/common'
import { useField } from 'formik'

import TagInput, { TagInputProps } from 'components/data-entry/TagInput'

type TagFieldProps = Partial<TagInputProps> & {
  name: string
}
export const TagField = (props: TagFieldProps) => {
  const { name, ...other } = props
  const [field, , { setValue }] = useField<string>(name)
  const { value, ...otherField } = field

  const tagList = (value ?? '').split(',').filter(removeNullable)
  const tagSet = new Set(value ? tagList : [])

  const handleChangeTags = useCallback(
    (value: Set<string>) => setValue([...value].join(',')),
    [setValue]
  )

  return (
    <TagInput
      defaultTags={tagList}
      tags={tagSet}
      {...otherField}
      onChangeTags={handleChangeTags}
      {...other}
    />
  )
}
