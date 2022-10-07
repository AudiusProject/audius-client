import { useSelector } from 'react-redux'

import { getTrackOfflineDownloadStatus } from 'app/store/offline-downloads/selectors'
import { TrackDownloadStatus } from 'app/store/offline-downloads/slice'

import IconDownload from '../../assets/images/iconDownloadPurple.svg'
import IconDownloading from '../../assets/images/iconDownloading.svg'

type TrackDownloadIndicatorProps = {
  trackId: string
}

export const TrackDownloadIndicator = ({
  trackId
}: TrackDownloadIndicatorProps) => {
  //   const { isEnabled: isOfflineModeEnabled } = useFeatureFlag(
  //     FeatureFlags.OFFLINE_MODE_ENABLED
  //   )
  const isOfflineModeEnabled = true
  const downloadStatus = useSelector(getTrackOfflineDownloadStatus(trackId))

  if (!isOfflineModeEnabled || !downloadStatus) return null
  if (downloadStatus === TrackDownloadStatus.ERROR) {
    return null
  }
  if (downloadStatus === TrackDownloadStatus.LOADING) {
    return <IconDownloading />
  }
  if (downloadStatus === TrackDownloadStatus.SUCCESS) {
    return <IconDownload />
  }
  return null
}
