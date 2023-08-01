import { imageBlank as placeholderArt } from '@audius/common'
import { HarmonyButton, HarmonyButtonType, IconUpload } from '@audius/stems'
import cn from 'classnames'

import layoutStyles from 'components/layout/layout.module.css'
import { Text } from 'components/typography'

import { TrackForUpload } from '../components/types'
import { useIndexedField } from '../forms/utils'

import styles from './MultiTrackSidebar.module.css'

const messages = {
  title: 'UPLOADED TRACKS',
  complete: 'Complete Upload'
}

type MultiTrackSidebarProps = {
  tracks: TrackForUpload[]
}

export const MultiTrackSidebar = (props: MultiTrackSidebarProps) => {
  const { tracks } = props

  return (
    <div className={styles.root}>
      <div className={cn(layoutStyles.col)}>
        <div className={styles.title}>
          <Text variant='title' size='xSmall'>
            {messages.title}
          </Text>
        </div>
        <div className={cn(styles.body, layoutStyles.col, layoutStyles.gap2)}>
          <TrackNavigator tracks={tracks} />
          <div className={styles.completeButton}>
            <HarmonyButton
              text={messages.complete}
              variant={HarmonyButtonType.PRIMARY}
              iconRight={IconUpload}
              fullWidth
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const TrackNavigator = (props: MultiTrackSidebarProps) => {
  const { tracks } = props
  return (
    <div className={cn(styles.tracks, layoutStyles.col)}>
      {tracks.map((track, i) => (
        <TrackRow key={i} track={track} index={i} />
      ))}
    </div>
  )
}

type TrackRowProps = {
  track: TrackForUpload
  index: number
}

const TrackRow = (props: TrackRowProps) => {
  const { track, index } = props
  const [{ value: artworkUrl }] = useIndexedField<string>(
    `trackMetadatas`,
    index,
    'artwork.url'
  )
  return (
    <div className={cn(styles.track, layoutStyles.row, layoutStyles.gap3)}>
      <div className={layoutStyles.row}>
        <Text className={styles.trackIndex}>{index + 1}</Text>
        <div
          className={styles.artwork}
          style={{
            backgroundImage: `url(${artworkUrl || placeholderArt})`
          }}
        />
      </div>
      {track.metadata.title}
    </div>
  )
}
