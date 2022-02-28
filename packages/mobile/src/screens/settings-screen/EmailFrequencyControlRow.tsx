import { useCallback } from 'react'

import { updateEmailFrequency } from 'audius-client/src/common/store/pages/settings/actions'
import { getEmailFrequency } from 'audius-client/src/common/store/pages/settings/selectors'
import { EmailFrequency } from 'audius-client/src/common/store/pages/settings/types'

import { SegmentedControl } from 'app/components/core'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'

import { SettingsRowLabel } from './SettingRowLabel'
import { SettingsRow } from './SettingsRow'
import { SettingsRowContent } from './SettingsRowContent'

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
  const dispatchWeb = useDispatchWeb()
  const emailFrequency = useSelectorWeb(getEmailFrequency)

  const handleSelectOption = useCallback(
    (option: EmailFrequency) => {
      dispatchWeb(updateEmailFrequency(option))
    },
    [dispatchWeb]
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
