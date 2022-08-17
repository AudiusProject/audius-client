import { useCallback, useMemo } from 'react'

import cn from 'classnames'
import moment from 'moment'
import { ColumnInstance } from 'react-table'

import { formatCount } from 'common/utils/formatUtil'
import { formatSeconds } from 'common/utils/timeUtil'
import { ArtistPopover } from 'components/artist/ArtistPopover'
import {
  TestTable,
  OverflowMenuButton,
  TableFavoriteButton,
  TablePlayButton,
  TableRepostButton,
  alphaSorter,
  dateSorter,
  numericSorter
} from 'components/test-table'
import Tooltip from 'components/tooltip/Tooltip'
import UserBadges from 'components/user-badges/UserBadges'

import styles from './TestTracksTable.module.css'

/* TODO:
  - Will need to be updated to remove the client side sorting and add state (probably in the table component) to sort which column is being sorted on and in which direction
  - Need to add the scroll logic to handle the paginated calls to the backend
*/

export type TracksTableColumn =
  | 'playButton'
  | 'trackName'
  | 'artistName'
  | 'date'
  | 'releaseDate'
  | 'listenDate'
  | 'length'
  | 'plays'
  | 'reposts'
  | 'overflowActions'

type TestTracksTableProps = {
  wrapperClassName?: string
  tableClassName?: string
  columns?: TracksTableColumn[]
  data: any[]
  userId?: number | null
  loading?: boolean
  // TODO: Need to add the rows and skeletons when the loadingRowCount is passed
  // loadingRowCount?: number
  playing?: boolean
  playingIndex?: number
  isVirtualized?: boolean
  maxRowNum?: number
  defaultSorter?: (a: any, b: any) => number
  onClickRow?: (track: any, index: number) => void
  onClickFavorite?: (track: any) => void
  onClickRepost?: (track: any) => void
  onClickTrackName?: (track: any) => void
  onClickArtistName?: (track: any) => void
  onSortTracks?: (sortProps: {
    column: { sorter: (a: any, b: any) => number }
    order: string
  }) => void
  // TODO: Need to add onReorderTracks
}

const defaultColumns: TracksTableColumn[] = [
  'playButton',
  'trackName',
  'artistName',
  'releaseDate',
  'listenDate',
  'length',
  'plays',
  'reposts',
  'overflowActions'
]

export const TestTracksTable = ({
  wrapperClassName,
  tableClassName,
  columns = defaultColumns,
  data,
  loading = false,
  // loadingRowCount = 0,
  playingIndex = -1,
  playing = false,
  isVirtualized = false,
  maxRowNum = 20,
  defaultSorter,
  onClickRow,
  onClickArtistName,
  onClickFavorite,
  onClickRepost,
  onClickTrackName,
  onSortTracks,
  userId
}: TestTracksTableProps) => {
  // Cell Render Functions
  const renderPlayButtonCell = useCallback(
    (cellInfo) => {
      const index = cellInfo.row.index
      const active = index === playingIndex
      return (
        <TablePlayButton
          className={cn(styles.tablePlayButton, { [styles.active]: active })}
          paused={!playing}
          playing={active}
          hideDefault={false}
        />
      )
    },
    [playing, playingIndex]
  )

  const renderTrackNameCell = useCallback(
    (cellInfo) => {
      const track = cellInfo.row.original
      const index = cellInfo.row.index
      const deleted = track.is_delete || track.user?.is_deactivated
      return (
        <div
          className={styles.textContainer}
          onClick={(e) => {
            e.stopPropagation()
            if (!deleted) onClickTrackName?.(track)
          }}
        >
          <div
            className={cn(styles.textCell, {
              [styles.trackName]: !deleted,
              [styles.isPlaying]: index === playingIndex
            })}
          >
            {track.name}
            {deleted ? ` [Deleted By Artist]` : ''}
          </div>
        </div>
      )
    },
    [onClickTrackName, playingIndex]
  )

  const renderArtistNameCell = useCallback(
    (cellInfo) => {
      const track = cellInfo.row.original
      const index = cellInfo.row.index
      if (track.user?.is_deactivated) {
        return `${track.user?.name} [Deactivated]`
      }

      return (
        <div className={styles.artistCellContainer}>
          <ArtistPopover handle={track.user.handle}>
            <div
              className={styles.textContainer}
              onClick={(e) => {
                e.stopPropagation()
                onClickArtistName?.(track)
              }}
            >
              <div
                className={cn(styles.textCell, styles.artistName, {
                  [styles.isPlaying]: index === playingIndex
                })}
              >
                {track.artist}
              </div>
              <UserBadges
                userId={track.user.user_id}
                badgeSize={12}
                className={styles.badges}
              />
            </div>
          </ArtistPopover>
        </div>
      )
    },
    [onClickArtistName, playingIndex]
  )

  const renderPlaysCell = useCallback((cellInfo) => {
    const track = cellInfo.row.original
    return formatCount(track.plays)
  }, [])

  const renderRepostsCell = useCallback((cellInfo) => {
    const track = cellInfo.row.original
    return formatCount(track.repost_count)
  }, [])

  const renderLengthCell = useCallback((cellInfo) => {
    const track = cellInfo.row.original
    return formatSeconds(track.time)
  }, [])

  const renderDateCell = useCallback((cellInfo) => {
    const track = cellInfo.row.original
    return moment(track.date).format('M/D/YY')
  }, [])

  const renderReleaseDateCell = useCallback((cellInfo) => {
    const track = cellInfo.row.original
    return moment(track.created_at).format('M/D/YY')
  }, [])

  const renderListenDateCell = useCallback((cellInfo) => {
    const track = cellInfo.row.original
    return moment(track.dateListened).format('M/D/YY')
  }, [])

  const renderFavoriteButtonCell = useCallback(
    (cellInfo) => {
      const track = cellInfo.row.original
      const deleted = track.is_delete || !!track.user?.is_deactivated
      const isOwner = track.owner_id === userId
      if (deleted || isOwner) return null

      return (
        <Tooltip
          text={track.has_current_user_saved ? 'Unfavorite' : 'Favorite'}
        >
          <div>
            <TableFavoriteButton
              className={cn(styles.tableActionButton, {
                [styles.active]: track.has_current_user_saved
              })}
              onClick={(e) => {
                e.stopPropagation()
                onClickFavorite?.(track)
              }}
              favorited={track.has_current_user_saved}
            />
          </div>
        </Tooltip>
      )
    },
    [onClickFavorite, userId]
  )

  const renderRepostButtonCell = useCallback(
    (cellInfo) => {
      const track = cellInfo.row.original
      const deleted = track.is_delete || track.user?.is_deactivated
      if (deleted) return null
      const isOwner = track.owner_id === userId
      return isOwner ? null : (
        <Tooltip text={track.has_current_user_reposted ? 'Unrepost' : 'Repost'}>
          <div>
            <TableRepostButton
              className={cn(styles.tableActionButton, {
                [styles.active]: track.has_current_user_reposted
              })}
              onClick={(e) => {
                e.stopPropagation()
                onClickRepost?.(track)
              }}
              reposted={track.has_current_user_reposted}
            />
          </div>
        </Tooltip>
      )
    },
    [onClickRepost, userId]
  )

  const renderOverflowMenuCell = useCallback(
    (cellInfo) => {
      const track = cellInfo.row.original
      const deleted = track.is_delete || !!track.user.is_deactivated
      return (
        <OverflowMenuButton
          className={styles.tableActionButton}
          onClick={(e) => {
            e.stopPropagation()
          }}
          isDeleted={deleted}
          // onRemove={props.onClickRemove}
          // removeText={props.removeText}
          handle={track.handle}
          trackId={track.track_id}
          uid={track.uid}
          date={track.date}
          isFavorited={track.has_current_user_saved}
          isOwner={track.owner_id === userId}
          isOwnerDeactivated={!!track.user.is_deactivated}
          isArtistPick={track.user._artist_pick === track.track_id}
          index={cellInfo.row.index}
          trackTitle={track.name}
          albumId={null}
          albumName={null}
          trackPermalink={track.permalink}
        />
      )
    },
    [userId]
  )

  const renderTrackActions = useCallback(
    (cellInfo) => {
      return (
        <div className={styles.trackActionsContainer}>
          {renderRepostButtonCell(cellInfo)}
          {renderFavoriteButtonCell(cellInfo)}
          {renderOverflowMenuCell(cellInfo)}
        </div>
      )
    },
    [renderFavoriteButtonCell, renderOverflowMenuCell, renderRepostButtonCell]
  )

  // Columns
  const tableColumnMap: Record<
    TracksTableColumn,
    Partial<ColumnInstance>
  > = useMemo(
    () => ({
      artistName: {
        id: 'artistName',
        Header: 'Artist',
        accessor: 'artist',
        Cell: renderArtistNameCell,
        maxWidth: 300,
        width: 120,
        sortType: ({ original: rowA }: any, { original: rowB }: any) =>
          alphaSorter(rowA, rowB, 'artist'),
        sorter: (rowA: any, rowB: any) => alphaSorter(rowA, rowB, 'artist'),
        align: 'left'
      },
      date: {
        id: 'date',
        Header: 'Date',
        accessor: 'date',
        Cell: renderDateCell,
        maxWidth: 160,
        sortType: ({ original: rowA }: any, { original: rowB }: any) =>
          dateSorter(rowA, rowB, 'date'),
        sorter: (rowA: any, rowB: any) => dateSorter(rowA, rowB, 'date'),
        align: 'right'
      },
      listenDate: {
        id: 'dateListened',
        Header: 'Played',
        accessor: 'dateListened',
        Cell: renderListenDateCell,
        maxWidth: 160,
        sortType: ({ original: rowA }: any, { original: rowB }: any) =>
          dateSorter(rowA, rowB, 'dateListened'),
        sorter: (rowA: any, rowB: any) =>
          dateSorter(rowA, rowB, 'dateListened'),
        align: 'right'
      },
      releaseDate: {
        id: 'dateReleased',
        Header: 'Released',
        accessor: 'created_at',
        Cell: renderReleaseDateCell,
        maxWidth: 160,
        sortType: ({ original: rowA }: any, { original: rowB }: any) =>
          dateSorter(rowA, rowB, 'created_at'),
        sorter: (rowA: any, rowB: any) => dateSorter(rowA, rowB, 'created_at'),
        align: 'right'
      },
      reposts: {
        id: 'reposts',
        Header: 'Reposts',
        accessor: 'repost_count',
        Cell: renderRepostsCell,
        maxWidth: 160,
        sortType: ({ original: rowA }: any, { original: rowB }: any) =>
          numericSorter(rowA, rowB, 'repost_count'),
        sorter: (rowA: any, rowB: any) =>
          numericSorter(rowA, rowB, 'repost_count'),
        align: 'right'
      },
      plays: {
        id: 'plays',
        Header: 'Plays',
        accessor: 'plays',
        Cell: renderPlaysCell,
        maxWidth: 160,
        sortType: ({ original: rowA }: any, { original: rowB }: any) =>
          numericSorter(rowA, rowB, 'plays'),
        sorter: (rowA: any, rowB: any) => numericSorter(rowA, rowB, 'plays'),
        align: 'right'
      },
      playButton: {
        id: 'playButton',
        Cell: renderPlayButtonCell,
        minWidth: 48,
        maxWidth: 48,
        disableResizing: true,
        disableSortBy: true
      },
      overflowActions: {
        id: 'trackActions',
        Cell: renderTrackActions,
        minWidth: 144,
        maxWidth: 144,
        width: 144,
        disableResizing: true,
        disableSortBy: true
      },
      length: {
        id: 'time',
        Header: 'Length',
        accessor: 'time',
        Cell: renderLengthCell,
        maxWidth: 160,
        sortType: ({ original: rowA }: any, { original: rowB }: any) =>
          numericSorter(rowA, rowB, 'time'),
        sorter: (rowA: any, rowB: any) => numericSorter(rowA, rowB, 'time'),
        align: 'right'
      },
      trackName: {
        id: 'trackName',
        Header: 'Track Name',
        accessor: 'title',
        Cell: renderTrackNameCell,
        maxWidth: 300,
        width: 120,
        sortType: ({ original: rowA }: any, { original: rowB }: any) =>
          alphaSorter(rowA, rowB, 'title'),
        sorter: (rowA: any, rowB: any) => alphaSorter(rowA, rowB, 'title'),
        align: 'left'
      }
    }),
    [
      renderArtistNameCell,
      renderDateCell,
      renderLengthCell,
      renderListenDateCell,
      renderPlayButtonCell,
      renderPlaysCell,
      renderReleaseDateCell,
      renderRepostsCell,
      renderTrackActions,
      renderTrackNameCell
    ]
  )

  const tableColumns = useMemo(
    () => columns.map((id) => tableColumnMap[id]),
    [columns, tableColumnMap]
  )

  const handleClickRow = useCallback(
    (rowInfo, index: number) => {
      const track = rowInfo.original
      const deleted = track.is_delete || track.user?.is_deactivated
      if (deleted) return
      onClickRow?.(track, index)
    },
    [onClickRow]
  )

  const getRowClassName = useCallback(
    (rowIndex) => {
      const track = data[rowIndex]
      const deleted = track.is_delete || !!track.user?.is_deactivated
      return cn(styles.tableRow, { [styles.disabled]: deleted })
    },
    [data]
  )

  return (
    <TestTable
      wrapperClassName={wrapperClassName}
      tableClassName={tableClassName}
      getRowClassName={getRowClassName}
      columns={tableColumns}
      maxRowNum={maxRowNum}
      data={data}
      loading={loading}
      onClickRow={handleClickRow}
      onSort={onSortTracks}
      defaultSorter={defaultSorter}
      activeIndex={playingIndex}
      isVirtualized={isVirtualized}
    />
  )
}
