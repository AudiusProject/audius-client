import { View } from 'react-native'

import { Text } from 'app/components/core'
import { DownloadStatusIndicator } from 'app/components/offline-downloads'
import { OfflineDownloadStatus } from 'app/store/offline-downloads/slice'
import { makeStyles } from 'app/styles'

type DownloadProgressHeaderProps = {
  isDownloading: boolean
}

const messages = {
  downloading: 'Downloading',
  onYourDevice: 'On Your Device'
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  downloadStatusIndicator: {
    marginRight: spacing(2)
  },
  headerText: {
    letterSpacing: 2,
    lineHeight: 17,
    textAlign: 'center',
    textTransform: 'uppercase'
  }
}))

export const DownloadProgressHeader = (props: DownloadProgressHeaderProps) => {
  const { isDownloading } = props
  const styles = useStyles()

  const getTextColor = () => {
    if (isDownloading) {
      return 'secondary'
    }
    return 'neutralLight4'
  }

  return (
    <View style={styles.root}>
      <DownloadStatusIndicator
        status={
          isDownloading
            ? OfflineDownloadStatus.SUCCESS
            : OfflineDownloadStatus.INIT
        }
        style={styles.downloadStatusIndicator}
      />
      <Text
        style={styles.headerText}
        color={getTextColor()}
        weight='demiBold'
        fontSize='small'
      >
        {isDownloading ? messages.downloading : messages.onYourDevice}
      </Text>
    </View>
  )
}
