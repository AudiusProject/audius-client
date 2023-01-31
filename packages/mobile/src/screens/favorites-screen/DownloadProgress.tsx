import { View } from 'react-native'
import { useSelector } from 'react-redux'

import { Text } from 'app/components/core'
import { ProgressBar } from 'app/components/progress-bar'
import { getOfflineDownloadStatus } from 'app/store/offline-downloads/selectors'
import { OfflineDownloadStatus } from 'app/store/offline-downloads/slice'
import { makeStyles } from 'app/styles'

const useStyles = makeStyles(({ palette, spacing }) => ({
  root: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: spacing(2)
  },
  text: {
    marginBottom: 2
  },
  progressBar: {
    width: 98,
    height: spacing(1),
    borderRadius: 8,
    marginVertical: 0,
    backgroundColor: palette.neutralLight4
  }
}))

export const DownloadProgress = () => {
  const styles = useStyles()
  const downloadStatus = useSelector(getOfflineDownloadStatus)
  const numDownloads = Object.keys(downloadStatus).length
  const numDownloadsComplete = Object.values(downloadStatus).filter(
    (status) =>
      status === OfflineDownloadStatus.SUCCESS ||
      status === OfflineDownloadStatus.ERROR
  ).length

  // Only render if there are active downloads
  if (numDownloadsComplete === numDownloads) return null

  return (
    <View style={styles.root}>
      <Text style={styles.text} color='neutral' weight='demiBold' fontSize='xs'>
        {`${numDownloadsComplete}/${numDownloads}`}
      </Text>
      <ProgressBar
        style={{
          root: styles.progressBar
        }}
        progress={numDownloadsComplete}
        max={numDownloads}
      />
    </View>
  )
}
