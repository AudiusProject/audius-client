import { useCallback } from 'react'

import { NetInfoStateType } from '@react-native-community/netinfo'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import IconDownload from 'app/assets/images/iconCloudDownload.svg'
import { Switch } from 'app/components/core'
import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'
import { getDownloadNetworkTypePreference } from 'app/store/offline-downloads/selectors'
import { setDownloadNetworkPreference } from 'app/store/offline-downloads/slice'
import { makeStyles } from 'app/styles'

import { SettingsRowLabel } from './SettingRowLabel'
import { SettingsRow } from './SettingsRow'
import { SettingsRowDescription } from './SettingsRowDescription'

const messages = {
  wifiOnly: 'Download on Wi-Fi Only',
  wifiOnlyBody:
    "When enabled, you'll only be able to download while connected to a Wi-Fi network"
}

const useStyles = makeStyles(({ palette }) => ({
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  labelOff: {
    color: palette.neutralLight4
  }
}))

export const DownloadNetworkPreferenceRow = () => {
  const isOfflineDownloadEnabled = useIsOfflineModeEnabled()
  const dispatch = useDispatch()
  const styles = useStyles()
  const downloadNetworkTypePreference = useSelector(
    getDownloadNetworkTypePreference
  )
  const downloadOverWifiOnly =
    downloadNetworkTypePreference === NetInfoStateType.wifi

  const handleSetNetworkPreference = useCallback(
    (value: boolean) => {
      const downloadNetworkPreference = value
        ? NetInfoStateType.wifi
        : NetInfoStateType.cellular
      dispatch(setDownloadNetworkPreference({ downloadNetworkPreference }))
    },
    [dispatch]
  )

  if (!isOfflineDownloadEnabled) return null

  return (
    <SettingsRow>
      <View style={styles.content}>
        <SettingsRowLabel label={messages.wifiOnly} icon={IconDownload} />
        <Switch
          onValueChange={handleSetNetworkPreference}
          value={downloadOverWifiOnly}
        />
      </View>

      <SettingsRowDescription>{messages.wifiOnlyBody}</SettingsRowDescription>
    </SettingsRow>
  )
}
