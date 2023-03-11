import { Screen, ScreenContent } from 'app/components/core'

import { DownloadAllFavoritesRow } from './DownloadAllFavoritesRow'
import { DownloadNetworkPreferenceRow } from './DownloadNetworkPreferenceRow'
import { DownloadProgressDetailed } from './DownloadProgressDetailed'
import { RemoveAllDownloadsRow } from './RemoveAllDownloadsRow'

const messages = {
  title: 'Download Settings'
}

export const DownloadSettingsScreen = () => {
  return (
    <Screen title={messages.title} variant='secondary' topbarRight={null}>
      <ScreenContent>
        <DownloadProgressDetailed />
        <DownloadAllFavoritesRow />
        <DownloadNetworkPreferenceRow />
        <RemoveAllDownloadsRow />
      </ScreenContent>
    </Screen>
  )
}
