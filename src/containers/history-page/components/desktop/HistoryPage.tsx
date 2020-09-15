import React, { memo } from 'react'
import { Button, ButtonType, IconPause, IconPlay } from '@audius/stems'

import Header from 'components/general/header/desktop/Header'
import Page from 'components/general/Page'
import EmptyTable from 'components/tracks-table/EmptyTable'
import TracksTable from 'components/tracks-table/TracksTable'
import { ID } from 'models/common/Identifiers'

import styles from './HistoryPage.module.css'
import FilterInput from 'components/general/filter-input/FilterInput'
import Spin from 'antd/lib/spin'

export type HistoryPageProps = {
  title: string
  description: string
  userId: ID
  entries: any
  dataSource: any
  playingIndex: number
  isEmpty: boolean
  loading: boolean
  queuedAndPlaying: boolean
  onClickRow: (record: any) => void
  onClickSave: (record: any) => void
  onClickTrackName: (record: any) => void
  onClickArtistName: (record: any) => void
  onClickRepost: (record: any) => void
  onSortTracks: (sorters: any) => void
  goToRoute: (route: string) => void
  onPlay: () => void
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  filterText: string
}

const HistoryPage = ({
  title,
  description,
  userId,
  entries,
  dataSource,
  playingIndex,
  isEmpty,
  loading,
  queuedAndPlaying,
  onClickRow,
  onClickSave,
  onClickTrackName,
  onClickArtistName,
  onClickRepost,
  onSortTracks,
  goToRoute,
  onPlay,
  onFilterChange,
  filterText
}: HistoryPageProps) => {
  const tableLoading = !dataSource.every((track: any) => track.play_count > -1)

  const playAllButton = !loading ? (
    <Button
      className={styles.playAllButton}
      textClassName={styles.playAllButtonText}
      iconClassName={styles.playAllButtonIcon}
      type={ButtonType.PRIMARY_ALT}
      text={queuedAndPlaying ? 'PAUSE' : 'PLAY'}
      leftIcon={queuedAndPlaying ? <IconPause /> : <IconPlay />}
      onClick={onPlay}
    />
  ) : null

  const trackTableActions = loading
    ? {}
    : {
        onClickFavorite: onClickSave,
        onClickRow,
        onClickTrackName,
        onClickArtistName,
        onClickRepost,
        onSortTracks
      }

  const filter = (
    <FilterInput
      placeholder='Filter Tracks'
      onChange={onFilterChange}
      value={filterText}
    />
  )

  const header = (
    <Header
      primary='History'
      secondary={isEmpty ? null : playAllButton}
      containerStyles={styles.historyPageHeader}
      rightDecorator={!isEmpty && filter}
    />
  )

  return (
    <Page
      title={title}
      description={description}
      contentClassName={styles.historyPageWrapper}
      header={header}
    >
      <div className={styles.bodyWrapper}>
        {loading ? (
          <Spin size='large' className={styles.spin} />
        ) : isEmpty && !loading && !tableLoading ? (
          <EmptyTable
            primaryText='You haven’t listened to any tracks yet.'
            secondaryText='Once you have, this is where you’ll find them!'
            buttonLabel='Start Listening'
            onClick={() => goToRoute('/trending')}
          />
        ) : (
          <div className={styles.tableWrapper}>
            <TracksTable
              userId={userId}
              loading={tableLoading}
              loadingRowsCount={entries.length}
              playing={queuedAndPlaying}
              playingIndex={playingIndex}
              dataSource={dataSource}
              {...trackTableActions}
            />
          </div>
        )}
      </div>
    </Page>
  )
}

export default memo(HistoryPage)
