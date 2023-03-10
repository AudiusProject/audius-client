import { reachabilitySelectors } from '@audius/common'
import { useSelector } from 'react-redux'

import { Text, Tile } from 'app/components/core'
import { ProgressBar } from 'app/components/progress-bar'
import { getOfflineTrackStatus } from 'app/store/offline-downloads/selectors'
import { OfflineDownloadStatus } from 'app/store/offline-downloads/slice'
import { makeStyles } from 'app/styles'

import { FavoritesDownloadStatusIndicator } from './FavoritesDownloadStatusIndicator'

type DownloadProgressDetailedProps = {
  favoritesToggleValue: boolean
}

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

export const DownloadProgressDetailed = (
  props: DownloadProgressDetailedProps
) => {
  const { favoritesToggleValue } = props

  const styles = useStyles()
  const downloadStatus = useSelector(getOfflineTrackStatus)
  const numDownloads = Object.keys(downloadStatus).length
  const numDownloadsSuccess = Object.values(downloadStatus).filter(
    (status) => status === OfflineDownloadStatus.SUCCESS
  ).length

  return (
    <Tile style={styles.root}>
      <FavoritesDownloadStatusIndicator switchValue={favoritesToggleValue} />
      <Text style={styles.text} color='neutral' weight='demiBold' fontSize='xs'>
        {`${numDownloadsSuccess}/${numDownloads}`}
      </Text>
      <ProgressBar
        style={{
          root: styles.progressBar
        }}
        progress={numDownloadsSuccess}
        max={numDownloads}
      />
    </Tile>
  )
}
