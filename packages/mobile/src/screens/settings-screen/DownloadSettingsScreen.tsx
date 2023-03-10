import { useState } from 'react'

import { Screen, ScreenContent } from 'app/components/core'

import { DownloadAllFavoritesRow } from './DownloadAllFavoritesRow'
import { DownloadNetworkPreferenceRow } from './DownloadNetworkPreferenceRow'
import { DownloadProgressDetailed } from './DownloadProgressDetailed'
import { RemoveAllDownloadsRow } from './RemoveAllDownloadsRow'

const messages = {
  title: 'Download Settings'
}

export const DownloadSettingsScreen = () => {
  const [favoritesToggleValue, setToggleValue] = useState(false)

  return (
    <Screen title={messages.title} variant='secondary' topbarRight={null}>
      <ScreenContent>
        <DownloadProgressDetailed favoritesToggleValue={favoritesToggleValue} />
        <DownloadAllFavoritesRow onValueChange={setToggleValue} />
        <DownloadNetworkPreferenceRow />
        <RemoveAllDownloadsRow />
      </ScreenContent>
    </Screen>
  )
}
