import { View } from 'react-native'
import { useSelector } from 'react-redux'

import { getTrackOfflineDownloadStatus } from 'app/store/offline-downloads/selectors'
import { TrackDownloadStatus } from 'app/store/offline-downloads/slice'
import { makeStyles } from 'app/styles'

import IconDownload from '../../assets/images/iconDownloadPurple.svg'
import IconDownloading from '../../assets/images/iconDownloading.svg'
import LoadingSpinner from '../loading-spinner'

type TrackDownloadIndicatorProps = {
  trackId: string
}

const useStyles = makeStyles(() => ({
  loadingSpinner: {
    position: 'absolute',
    height: 11,
    width: 11,
    top: 2.2,
    left: 2.2
  }
}))

// TODO: generic download indicator
export const TrackDownloadIndicator = ({
  trackId
}: TrackDownloadIndicatorProps) => {
  //   const { isEnabled: isOfflineModeEnabled } = useFeatureFlag(
  //     FeatureFlags.OFFLINE_MODE_ENABLED
  //   )
  const isOfflineModeEnabled = true
  const downloadStatus = useSelector(getTrackOfflineDownloadStatus(trackId))
  const styles = useStyles()

  if (!isOfflineModeEnabled || !downloadStatus) return null
  if (downloadStatus === TrackDownloadStatus.ERROR) {
    return null
  }
  if (downloadStatus === TrackDownloadStatus.LOADING) {
    return (
      <View>
        <IconDownloading />
        <LoadingSpinner style={styles.loadingSpinner} />
      </View>
    )
  }
  if (downloadStatus === TrackDownloadStatus.SUCCESS) {
    return <IconDownload />
  }
  return null
}
