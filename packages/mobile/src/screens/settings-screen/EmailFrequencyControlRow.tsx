import { useCallback } from 'react'

import {
  settingsPageActions,
  settingsPageSelectors,
  EmailFrequency
} from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'

import { SegmentedControl } from 'app/components/core'

import { SettingsRowLabel } from './SettingRowLabel'
import { SettingsRow } from './SettingsRow'
import { SettingsRowContent } from './SettingsRowContent'
const { getEmailFrequency } = settingsPageSelectors
const { updateEmailFrequency } = settingsPageActions

const messages = {
  emailFrequency: "'What You Missed' Email Frequency",
  live: 'Live',
  daily: 'Daily',
  weekly: 'Weekly',
  off: 'Off'
}

const emailFrequencyOptions = [
  { key: EmailFrequency.Live, text: messages.live },
  { key: EmailFrequency.Daily, text: messages.daily },
  { key: EmailFrequency.Weekly, text: messages.weekly },
  { key: EmailFrequency.Off, text: messages.off }
]

export const EmailFrequencyControlRow = () => {
  const dispatch = useDispatch()
  const emailFrequency = useSelector(getEmailFrequency)

  const handleSelectOption = useCallback(
    (option: EmailFrequency) => {
      dispatch(updateEmailFrequency(option))
    },
    [dispatch]
  )

  return (
    <SettingsRow>
      <SettingsRowLabel label={messages.emailFrequency} />
      <SettingsRowContent>
        <SegmentedControl
          fullWidth
          options={emailFrequencyOptions}
          selected={emailFrequency}
          onSelectOption={handleSelectOption}
        />
      </SettingsRowContent>
    </SettingsRow>
  )
}
