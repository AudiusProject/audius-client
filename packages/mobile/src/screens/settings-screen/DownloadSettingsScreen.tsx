import { useState } from 'react'

import { Screen, ScreenContent } from 'app/components/core'

import { DownloadProgressDetailed } from '../favorites-screen/DownloadProgressDetailed'

import { Divider } from './Divider'
import { DownloadAllFavoritesRow } from './DownloadAllFavoritesRow'
import { DownloadNetworkPreferenceRow } from './DownloadNetworkPreferenceRow'
import { RemoveAllDownloadsRow } from './RemoveAllDownloadsRow'

const messages = {
  title: 'Download Settings'
}

export const DownloadSettingsScreen = () => {
  const [favoritesToggleValue, setToggleValue] = useState(false)

  return (
    <Screen title={messages.title} variant='secondary' topbarRight={null}>
      <ScreenContent>
        <Divider />
        <DownloadProgressDetailed favoritesToggleValue={favoritesToggleValue} />
        <DownloadAllFavoritesRow onValueChange={setToggleValue} />
        <DownloadNetworkPreferenceRow />
        <RemoveAllDownloadsRow />
      </ScreenContent>
    </Screen>
  )
}
