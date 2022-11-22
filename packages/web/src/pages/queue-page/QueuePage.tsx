import { useCallback } from 'react'

import { cacheTracksSelectors, queueSelectors, Track } from '@audius/common'
import { useSelector } from 'react-redux'

import Header from 'components/header/desktop/Header'
import Page from 'components/page/Page'
import { TracksTable, TracksTableColumn } from 'components/tracks-table'

import styles from './QueuePage.module.css'

export const QueuePage = () => {
  const queue = useSelector(queueSelectors.getOrder)
  const tracks = useSelector((state) => {
    const tracksMap = cacheTracksSelectors.getTracks(state, {
      ids: queue.map((item) => item.id as number)
    })
    return queue.map((item) => tracksMap[item.id as number])
  })

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
  }, [])

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
        disabledTrackEdit
        columns={tableColumns}
        onClickRow={() => {}}
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
