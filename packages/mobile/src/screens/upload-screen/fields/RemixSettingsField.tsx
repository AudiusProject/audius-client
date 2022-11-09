import { useCallback } from 'react'

import { useField } from 'formik'
import { View } from 'react-native'

import type { ContextualSubmenuProps } from 'app/components/core'
import { Text, ContextualSubmenu } from 'app/components/core'

import type { RemixSettingsValue } from '../screens'

const messages = {
  label: 'Remix Settings',
  remixOf: 'Remix Of'
}

type SelectMoodFieldProps = Partial<ContextualSubmenuProps>

export const RemixSettingsField = (props: SelectMoodFieldProps) => {
  const [{ value: remixOf }, , { setValue: setRemixOf }] =
    useField<string>('remix_of')
  const [{ value: remixesVisible }, , { setValue: setRemixesVisible }] =
    useField<boolean>('field_visibility.remixes')

  const value = {
    remixOf,
    remixesVisible
  }

  console.log('value?', value)

  const handleChange = useCallback(
    (value: RemixSettingsValue) => {
      const { remixOf, remixesVisible } = value
      setRemixOf(remixOf)
      setRemixesVisible(remixesVisible)
    },
    [setRemixOf, setRemixesVisible]
  )

  const renderValue = useCallback((value: any) => {
    return value.remix_of ? (
      <View>
        <Text>{messages.remixOf}</Text>
        <Text>{value.remix_of}</Text>
      </View>
    ) : null
  }, [])

  return (
    <ContextualSubmenu
      submenuScreenName='RemixSettings'
      label={messages.label}
      onChange={handleChange}
      value={value}
      renderValue={renderValue}
      {...props}
    />
  )
}
