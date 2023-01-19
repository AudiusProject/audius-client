import { useCallback } from 'react'

import { useDrawer } from 'app/hooks/useDrawer'
import { removeAllDownloadedFavorites } from 'app/services/offline-downloader'

import { ConfirmationDrawer } from './ConfirmationDrawer'

const messages = {
  header: 'Are You Sure?',
  description:
    'Are you sure you want to remove all of your downloaded favorites?',
  confirm: 'Remove All Downloads'
}

const drawerName = 'RemoveDownloadedFavorites'

export const RemoveDownloadedFavoritesDrawer = () => {
  const { data } = useDrawer(drawerName)
  const { tracksForDownload } = data

  const handleConfirm = useCallback(() => {
    removeAllDownloadedFavorites(tracksForDownload)
  }, [tracksForDownload])

  return (
    <ConfirmationDrawer
      drawerName={drawerName}
      messages={messages}
      onConfirm={handleConfirm}
    />
  )
}
