import { useCallback } from 'react'

import { getAccountUser } from 'audius-client/src/common/store/account/selectors'
import {
  CastMethod,
  updateMethod
} from 'audius-client/src/common/store/cast/slice'

import Appearance from 'app/assets/images/emojis/waning-crescent-moon.png'
import { SegmentedControl } from 'app/components/core'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'

import { SettingsRowLabel } from './SettingRowLabel'
import { SettingsRow } from './SettingsRow'
import { SettingsRowContent } from './SettingsRowContent'
import { SettingsRowDescription } from './SettingsRowDescription'

const messages = {
  cast: 'Cast to Devices',
  castDescription: 'Select your preferred casting method',
  airplay: 'Airplay',
  chromecast: 'Chromecast'
}

export const CastSettingsRow = () => {
  const dispatchWeb = useDispatchWeb()
  const accountUser = useSelectorWeb(getAccountUser)

  const setCastMethod = useCallback(
    (method: CastMethod) => {
      // Changes should be persisted to async storage so that the
      // settings row value persists between sessions.
      dispatchWeb(updateMethod({ method: method, persist: true }))
    },
    [dispatchWeb]
  )

  if (!accountUser) return null

  const castOptions = [
    { key: 'airplay', text: messages.airplay },
    { key: 'chromecast', text: messages.chromecast }
  ]

  return (
    <SettingsRow>
      <SettingsRowLabel label={messages.cast} iconSource={Appearance} />
      <SettingsRowDescription>
        {messages.castDescription}
      </SettingsRowDescription>
      <SettingsRowContent>
        <SegmentedControl
          fullWidth
          options={castOptions}
          defaultSelected={'airplay'}
          onSelectOption={setCastMethod}
        />
      </SettingsRowContent>
    </SettingsRow>
  )
}
