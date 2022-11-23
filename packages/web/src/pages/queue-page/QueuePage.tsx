import { useCallback } from 'react'

import { cacheTracksSelectors, collectionPageLineupActions as tracksActions,
  queueSelectors, Track, CollectionPageTrackRecord, Name, PlaybackSource, playerSelectors } from '@audius/common'
import { useSelector, useDispatch } from 'react-redux'
import { TrackEvent, make } from 'common/store/analytics/actions'

import Header from 'components/header/desktop/Header'
import Page from 'components/page/Page'
import { TracksTable, TracksTableColumn } from 'components/tracks-table'
const { getPlaying, getUid } = playerSelectors
const { makeGetCurrent } = queueSelectors

import styles from './QueuePage.module.css'


export const QueuePage = () => {
  const dispatch = useDispatch()
  const queue = useSelector(queueSelectors.getOrder)
  const index = useSelector(queueSelectors.getIndex)
  const tracksMap = useSelector((state) => {
    return cacheTracksSelectors.getTracks(state, {
      ids: queue.map((item) => item.id as number)
    })
  })
  const tracks = queue.map((item) => tracksMap[item.id as number])
  const playing = useSelector((state) => getPlaying(state))
  const playingUid = useSelector((state) => getUid(state))

  const play = (uid?: string) => dispatch(tracksActions.play(uid)) 
  const pause = () => dispatch(tracksActions.pause()) 
  const record = (event: TrackEvent) => dispatch(event)

  const onClickRow = (trackRecord: CollectionPageTrackRecord, index: number) => {
    if (playing && playingUid === queue[index].uid) {
      pause()
      record(
        make(Name.PLAYBACK_PAUSE, {
          id: `${trackRecord.track_id}`,
          source: PlaybackSource.PLAYLIST_TRACK
        })
      )
    } else if (playingUid !== queue[index].uid) {
      // todo: play action erases the queue
      play(queue[index].uid)
      record(
        make(Name.PLAYBACK_PLAY, {
          id: `${trackRecord.track_id}`,
          source: PlaybackSource.PLAYLIST_TRACK
        })
      )
    } else {
      play()
      record(
        make(Name.PLAYBACK_PLAY, {
          id: `${trackRecord.track_id}`,
          source: PlaybackSource.PLAYLIST_TRACK
        })
      )
    }
  }

  const header = <Header primary='Queue' />
  const tableColumns: TracksTableColumn[] = [
    'spacer',
    'trackName',
    'releaseDate',
    'length',
    'plays',
    'reposts',
    'overflowMenu'
  ]

  const formatMetadata = useCallback((trackMetadatas: Track[]) => {
    return trackMetadatas
      .map((metadata, i) => ({
        ...metadata,
        key: `${metadata.title}_${metadata.dateListened}_${i}`,
        name: metadata.title,
        date: metadata.created_at,
        time: metadata.duration,
        saves: metadata.save_count,
        reposts: metadata.repost_count,
        plays: metadata.play_count
      }))
      .filter((meta) => !meta.is_invalid)
  }, [tracks])

  const formattedData = formatMetadata(tracks)
  return (
    <Page
      title='Queue'
      description='View and edit your queue.'
      contentClassName={styles.pageContainer}
      header={header}
    >
      <TracksTable
        data={formattedData}
        playing={true}
        playingIndex={index}
        disabledTrackEdit
        columns={tableColumns}
        onClickRow={onClickRow}
        onClickTrackName={() => {}}
        fetchPage={() => {}}
        pageSize={50}
        showMoreLimit={5}
        userId={3}
        onShowMoreToggle={() => {}}
        totalRowCount={0}
        isPaginated
      />
    </Page>
  )
}
