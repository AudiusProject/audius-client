import { HarmonyButton, HarmonyButtonType, IconTrash } from '@audius/stems'
import numeral from 'numeral'

import iconFileAiff from 'assets/img/iconFileAiff.svg'
import iconFileFlac from 'assets/img/iconFileFlac.svg'
import iconFileMp3 from 'assets/img/iconFileMp3.svg'
import iconFileOgg from 'assets/img/iconFileOgg.svg'
import iconFileUnknown from 'assets/img/iconFileUnknown.svg'
import iconFileWav from 'assets/img/iconFileWav.svg'
import { Text } from 'components/typography'

import styles from './TrackPreview.module.css'

const fileTypeIcon = (type: string) => {
  switch (type) {
    case 'audio/mpeg':
    case 'audio/mp3':
      return iconFileMp3
    case 'audio/aiff':
      return iconFileAiff
    case 'audio/flac':
      return iconFileFlac
    case 'audio/ogg':
      return iconFileOgg
    case 'audio/wav':
      return iconFileWav
    default:
      return iconFileUnknown
  }
}

type TrackPreviewProps = {
  fileType: string
  trackTitle: string
  fileSize: number
  index: number
  displayIndex: boolean
  onRemove: () => void
}

export const TrackPreviewNew = (props: TrackPreviewProps) => {
  const {
    displayIndex = false,
    index,
    fileType = 'audio/mp3',
    trackTitle = 'Untitled',
    fileSize,
    onRemove
  } = props

  const fileExtension = fileType.split('/')[1] ?? null

  return (
    <div className={styles.trackPreviewNew}>
      {displayIndex ? (
        <Text className={styles.indexText} size='small'>
          {index + 1}
        </Text>
      ) : null}
      <img
        className={styles.trackPreviewImage}
        src={fileTypeIcon(fileType)}
        alt='File type icon'
      />
      <Text className={styles.titleText} size='small'>
        {trackTitle}
        {fileExtension ? `.${fileExtension}` : null}
      </Text>
      <Text className={styles.fileSizeText} size='small' color='neutralLight2'>
        {numeral(fileSize).format('0.0 b')}
      </Text>
      <HarmonyButton
        variant={HarmonyButtonType.PLAIN}
        iconRight={IconTrash}
        onClick={onRemove}
        className={styles.removeButton}
      />
    </div>
  )
}
