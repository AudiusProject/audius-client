import { FeatureFlags } from '@audius/common'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

import { useFeatureFlag } from 'app/hooks/useRemoteConfig'
import { getItemOfflineDownloadStatus } from 'app/store/offline-downloads/selectors'
import { OfflineItemDownloadStatus } from 'app/store/offline-downloads/slice'
import { makeStyles } from 'app/styles'

import IconDownload from '../../assets/images/iconDownloadPurple.svg'
import IconDownloading from '../../assets/images/iconDownloading.svg'
import LoadingSpinner from '../loading-spinner'

type TrackDownloadIndicatorProps = {
  trackId: string
}

const useStyles = makeStyles(() => ({
  // TODO: replace with animated icon
  loadingSpinner: {
    position: 'absolute',
    height: 11,
    width: 11,
    top: 2.2,
    left: 2.2
  }
}))

export const TrackDownloadIndicator = ({
  trackId
}: TrackDownloadIndicatorProps) => {
  // const { isEnabled: isOfflineModeEnabled } = useFeatureFlag(
  //   FeatureFlags.OFFLINE_MODE_ENABLED
  // )
  const isOfflineModeEnabled = true

  const downloadStatus = useSelector(getItemOfflineDownloadStatus(trackId))
  const styles = useStyles()

  if (!isOfflineModeEnabled) return null

  switch (downloadStatus) {
    case OfflineItemDownloadStatus.LOADING:
      return (
        <View>
          <IconDownloading />
          <LoadingSpinner style={styles.loadingSpinner} />
        </View>
      )
    case OfflineItemDownloadStatus.SUCCESS:
      return <IconDownload />
    default:
      return null
  }
}
