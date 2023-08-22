import { MouseEvent, useCallback, useMemo } from 'react'

import { formatUSDCWeiToUSDString, USDCPurchaseDetails } from '@audius/common'
// import cn from 'classnames'
import moment from 'moment'
import { Cell, Row } from 'react-table'

import { Table } from 'components/table'

// import styles from './PurchasesTable.module.css'

type PurchaseCell = Cell<USDCPurchaseDetails>
type PurchaseRow = Row<USDCPurchaseDetails>

export type PurchasesTableColumn =
  | 'contentName'
  | 'artist'
  | 'date'
  | 'value'
  | 'spacerLeft'
  | 'spacerRight'

type PurchasesTableProps = {
  columns?: PurchasesTableColumn[]
  data: USDCPurchaseDetails[]
  isVirtualized?: boolean
  loading?: boolean
  onClickRow?: (txDetails: USDCPurchaseDetails, index: number) => void
  onSort: (sortMethod: string, sortDirection: string) => void
  fetchMore: (offset: number, limit: number) => void
  totalRowCount?: number
  scrollRef?: React.MutableRefObject<HTMLDivElement | undefined>
  fetchBatchSize: number
}

const defaultColumns: PurchasesTableColumn[] = [
  'spacerLeft',
  'contentName',
  'artist',
  'date',
  'value',
  'spacerRight'
]

// Cell Render Functions
const renderContentNameCell = (cellInfo: PurchaseCell) => {
  const { contentId /* , contentType */ } = cellInfo.row.original
  return <div>{contentId}</div>
}

const renderArtistCell = (cellInfo: PurchaseCell) => {
  const { sellerUserId } = cellInfo.row.original
  return <div>{sellerUserId}</div>
}

const renderDateCell = (cellInfo: PurchaseCell) => {
  const transaction = cellInfo.row.original
  return moment(transaction.createdAt).format('M/D/YY')
}

const renderValueCell = (cellInfo: PurchaseCell) => {
  const transaction = cellInfo.row.original
  return formatUSDCWeiToUSDString(transaction.amount)
}

// Columns
const tableColumnMap = {
  contentName: {
    id: 'contentName',
    Header: 'Sales',
    accessor: 'contentId',
    Cell: renderContentNameCell,
    width: 480,
    disableSortBy: false,
    align: 'left'
  },
  artist: {
    id: 'artist',
    Header: 'Artist',
    accessor: 'sellerUserId',
    Cell: renderArtistCell,
    maxWidth: 200,
    disableSortBy: false,
    align: 'left'
  },
  date: {
    id: 'date',
    Header: 'Date',
    accessor: 'createdAt',
    Cell: renderDateCell,
    maxWidth: 150,
    disableSortBy: false,
    align: 'right'
  },
  value: {
    id: 'value',
    Header: 'Value',
    accessor: 'amount',
    Cell: renderValueCell,
    maxWidth: 200,
    disableSortBy: true,
    align: 'right'
  },
  spacerLeft: {
    id: 'spacerLeft',
    maxWidth: 24,
    minWidth: 24,
    disableSortBy: true,
    disableResizing: true
  },
  spacerRight: {
    id: 'spacerRight',
    maxWidth: 24,
    minWidth: 24,
    disableSortBy: true,
    disableResizing: true
  }
}

export const PurchasesTable = ({
  columns = defaultColumns,
  data,
  isVirtualized = false,
  loading = false,
  onClickRow,
  onSort,
  fetchMore,
  totalRowCount,
  scrollRef,
  fetchBatchSize
}: PurchasesTableProps) => {
  const tableColumns = useMemo(
    () => columns.map((id) => tableColumnMap[id]),
    [columns]
  )

  const handleClickRow = useCallback(
    (
      _: MouseEvent<HTMLTableRowElement>,
      rowInfo: PurchaseRow,
      index: number
    ) => {
      onClickRow?.(rowInfo.original, index)
    },
    [onClickRow]
  )

  // TODO: Show loading spinner only for loading case

  return (
    <Table
      columns={tableColumns}
      data={data}
      loading={loading}
      onClickRow={handleClickRow}
      onSort={onSort}
      fetchMore={fetchMore}
      isVirtualized={isVirtualized}
      totalRowCount={totalRowCount}
      scrollRef={scrollRef}
      fetchBatchSize={fetchBatchSize}
    />
  )
}
