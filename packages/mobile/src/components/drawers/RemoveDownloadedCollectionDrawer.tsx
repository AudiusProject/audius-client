import { useCallback } from 'react'

import { useDrawer } from 'app/hooks/useDrawer'
import { removeCollectionDownload } from 'app/services/offline-downloader'

import { ConfirmationDrawer } from './ConfirmationDrawer'

const messages = {
  header: 'Are You Sure?',
  description:
    'Are you sure you want to remove this Playlist from your device?',
  confirm: 'Remove Downloaded Playlist'
}

const drawerName = 'RemoveDownloadedCollection'

export const RemoveDownloadedCollectionDrawer = () => {
  const { data } = useDrawer(drawerName)
  const { collectionId, tracksForDownload } = data

  const handleConfirm = useCallback(() => {
    removeCollectionDownload(collectionId, tracksForDownload)
  }, [collectionId, tracksForDownload])

  return (
    <ConfirmationDrawer
      drawerName={drawerName}
      messages={messages}
      onConfirm={handleConfirm}
    />
  )
}
