import { useCallback } from 'react'

import { NetInfoStateType } from '@react-native-community/netinfo'
import { useDispatch, useSelector } from 'react-redux'

import IconDownload from 'app/assets/images/iconDownload.svg'
import { SegmentedControl } from 'app/components/core'
import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'
import { getDownloadNetworkTypePreference } from 'app/store/offline-downloads/selectors'
import { setDownloadNetworkPreference } from 'app/store/offline-downloads/slice'

import { SettingsRowLabel } from './SettingRowLabel'
import { SettingsRow } from './SettingsRow'
import { SettingsRowContent } from './SettingsRowContent'

const messages = {
  downloadNetworkPreference: 'Offline Downloads Network Preference',
  wifi: 'Wifi Only',
  cellular: 'Wifi and Cellular'
}

export const DownloadNetworkPreferenceRow = () => {
  const isOfflineDownloadEnabled = useIsOfflineModeEnabled()
  const dispatch = useDispatch()
  const downloadNetworkTypePreference = useSelector(
    getDownloadNetworkTypePreference
  )

  const networkTypeOptions = [
    { key: NetInfoStateType.wifi, text: messages.wifi },
    { key: NetInfoStateType.cellular, text: messages.cellular }
  ]

  const handleSetNetworkPreference = useCallback(
    (downloadNetworkPreference: NetInfoStateType) => {
      dispatch(setDownloadNetworkPreference({ downloadNetworkPreference }))
    },
    [dispatch]
  )

  if (!isOfflineDownloadEnabled) return null

  return (
    <SettingsRow>
      <SettingsRowLabel
        label={messages.downloadNetworkPreference}
        icon={IconDownload}
      />
      <SettingsRowContent>
        <SegmentedControl
          fullWidth
          options={networkTypeOptions}
          defaultSelected={downloadNetworkTypePreference}
          onSelectOption={handleSetNetworkPreference}
        />
      </SettingsRowContent>
    </SettingsRow>
  )
}
