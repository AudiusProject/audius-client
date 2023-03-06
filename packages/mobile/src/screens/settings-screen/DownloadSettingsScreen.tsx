import { Screen, ScreenContent } from 'app/components/core'

import { Divider } from './Divider'
import { DownloadNetworkPreferenceRow } from './DownloadNetworkPreferenceRow'

const messages = {
  title: 'Download Settings'
}

export const DownloadSettingsScreen = () => {
  return (
    <Screen title={messages.title} variant='secondary' topbarRight={null}>
      <ScreenContent>
        <Divider />
        <DownloadNetworkPreferenceRow />
      </ScreenContent>
    </Screen>
  )
}
