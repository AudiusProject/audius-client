import { useCallback, useMemo } from 'react'

import { Chain } from '@audius/common'
import cn from 'classnames'
import { ColumnInstance } from 'react-table'

import { formatSeconds } from 'common/utils/timeUtil'
import { TestTable, TablePlayButton } from 'components/test-table'

import styles from './TestCollectiblesPlaylistTable.module.css'

const chainLabelMap: Record<Chain, string> = {
  [Chain.Eth]: 'Ethereum',
  [Chain.Sol]: 'Solana'
}

export type CollectiblesPlaylistTableColumn =
  | 'playButton'
  | 'collectibleName'
  | 'chain'
  | 'length'

type TestCollectiblesPlaylistTableProps = {
  wrapperClassName?: string
  tableClassName?: string
  columns?: CollectiblesPlaylistTableColumn[]
  data: any[]
  loading?: boolean
  playing?: boolean
  playingIndex?: number
  isVirtualized?: boolean
  maxRowNum?: number
  onClickRow?: (collectible: any, index: number) => void
  onClickTrackName?: (collectible: any) => void
}

const defaultColumns: CollectiblesPlaylistTableColumn[] = [
  'playButton',
  'collectibleName',
  'chain',
  'length'
]

export const TestCollectiblesPlaylistTable = ({
  wrapperClassName,
  tableClassName,
  columns = defaultColumns,
  data,
  loading = false,
  playing = false,
  playingIndex = -1,
  isVirtualized = false,
  maxRowNum = 20,
  onClickRow,
  onClickTrackName: onClickCollectibleName
}: TestCollectiblesPlaylistTableProps) => {
  console.log(chainLabelMap[Chain.Eth])

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

  const renderCollectibleNameCell = useCallback(
    (cellInfo) => {
      const collectible = cellInfo.row.original
      const index = cellInfo.row.index
      return (
        <div
          className={styles.textContainer}
          onClick={(e) => {
            e.stopPropagation()
            onClickCollectibleName?.(collectible)
          }}
        >
          <div
            className={cn(styles.textCell, styles.collectibleName, {
              [styles.isPlaying]: index === playingIndex
            })}
          >
            {collectible.name}
          </div>
        </div>
      )
    },
    [onClickCollectibleName, playingIndex]
  )

  const renderLengthCell = useCallback((cellInfo) => {
    const collectible = cellInfo.row.original
    return formatSeconds(collectible.duration)
  }, [])

  const renderChainCell = useCallback((cellInfo) => {
    const collectible = cellInfo.row.original
    return chainLabelMap[collectible.chain as Chain]
  }, [])

  // Columns
  const tableColumnMap: Record<
    CollectiblesPlaylistTableColumn,
    Partial<ColumnInstance>
  > = useMemo(
    () => ({
      playButton: {
        id: 'playButton',
        Cell: renderPlayButtonCell,
        minWidth: 48,
        maxWidth: 48,
        disableResizing: true,
        disableSortBy: true
      },
      collectibleName: {
        id: 'collectibleName',
        Header: 'Collectible Name',
        accessor: 'title',
        Cell: renderCollectibleNameCell,
        maxWidth: 600,
        width: 400,
        disableSortBy: true,
        align: 'left'
      },
      length: {
        id: 'duration',
        Header: 'Length',
        accessor: 'duration',
        Cell: renderLengthCell,
        maxWidth: 160,
        disableSortBy: true,
        align: 'right'
      },
      chain: {
        id: 'chain',
        Header: 'Chain',
        accessor: 'chain',
        Cell: renderChainCell,
        maxWidth: 160,
        disableSortBy: true,
        align: 'left'
      }
    }),
    [
      renderPlayButtonCell,
      renderCollectibleNameCell,
      renderLengthCell,
      renderChainCell
    ]
  )

  const tableColumns = useMemo(
    () => columns.map((id) => tableColumnMap[id]),
    [columns, tableColumnMap]
  )

  const handleClickRow = useCallback(
    (rowInfo, index: number) => {
      const collectible = rowInfo.original
      onClickRow?.(collectible, index)
    },
    [onClickRow]
  )

  const getRowClassName = useCallback(() => styles.tableRow, [])

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
      activeIndex={playingIndex}
      isVirtualized={isVirtualized}
    />
  )
}
