import { MouseEvent, useCallback, useMemo } from 'react'

import {
  formatUSDCWeiToUSDString,
  USDCContentPurchaseType,
  USDCPurchaseDetails
} from '@audius/common'
import moment from 'moment'

import { Table } from 'components/table'

import { TrackNameWithArtwork } from './components/TrackNameWithArtwork'
import { UserNameWithBadges } from './components/UserNameWithBadges'
import { PurchaseCell, PurchaseRow } from './types'
import { isEmptyPurchaseRow } from './utils'

export type SalesTableColumn =
  | 'contentName'
  | 'buyer'
  | 'date'
  | 'value'
  | 'spacerLeft'
  | 'spacerRight'

export type SalesTableSortMethod = 'contentId' | 'createdAt'
export type SalesTableSortDirection = 'asc' | 'desc'

type SalesTableProps = {
  columns?: SalesTableColumn[]
  data: USDCPurchaseDetails[]
  isVirtualized?: boolean
  loading?: boolean
  onClickRow?: (txDetails: USDCPurchaseDetails, index: number) => void
  onSort: (
    sortMethod: SalesTableSortMethod,
    sortDirection: SalesTableSortDirection
  ) => void
  fetchMore: (offset: number, limit: number) => void
  totalRowCount?: number
  scrollRef?: React.MutableRefObject<HTMLDivElement | undefined>
  fetchBatchSize: number
}

const defaultColumns: SalesTableColumn[] = [
  'spacerLeft',
  'contentName',
  'buyer',
  'date',
  'value',
  'spacerRight'
]

// Cell Render Functions
const renderContentNameCell = (cellInfo: PurchaseCell) => {
  const { contentId, contentType } = cellInfo.row.original
  return contentType === USDCContentPurchaseType.TRACK ? (
    <TrackNameWithArtwork id={contentId} />
  ) : (
    // TODO: When we support collection purchases
    <div />
  )
}

const renderBuyerCell = (cellInfo: PurchaseCell) => {
  const { buyerUserId } = cellInfo.row.original
  return <UserNameWithBadges userId={buyerUserId} />
}

const renderDateCell = (cellInfo: PurchaseCell) => {
  const transaction = cellInfo.row.original
  return moment(transaction.createdAt).format('M/D/YY')
}

const renderValueCell = (cellInfo: PurchaseCell) => {
  const transaction = cellInfo.row.original
  return `$${formatUSDCWeiToUSDString(transaction.amount)}`
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
  buyer: {
    id: 'buyer',
    Header: 'Purchased By',
    accessor: 'sellerUserId',
    Cell: renderBuyerCell,
    maxWidth: 200,
    disableSortBy: true,
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

/** Renders a table of `USDCPurchaseDetails` records, with details intended for the Seller */
export const SalesTable = ({
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
}: SalesTableProps) => {
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

  return (
    <Table
      columns={tableColumns}
      data={data}
      loading={loading}
      isEmptyRow={isEmptyPurchaseRow}
      onClickRow={handleClickRow}
      onSort={onSort}
      fetchMore={fetchMore}
      isVirtualized={isVirtualized}
      totalRowCount={totalRowCount ?? 0}
      scrollRef={scrollRef}
      fetchBatchSize={fetchBatchSize}
    />
  )
}
