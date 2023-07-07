import { MouseEvent, useCallback, useMemo } from 'react'

import {
  formatAudio,
  TransactionMethod,
  TransactionType,
  Kind,
  TransactionDetails
} from '@audius/common'
import cn from 'classnames'
import moment from 'moment'
import { Cell, Row } from 'react-table'

import { AudioTransactionIcon } from 'components/audio-transaction-icon'
import { Table } from 'components/table'
import Tooltip from 'components/tooltip/Tooltip'

import styles from './AudioTransactionsTable.module.css'

const transactionTypeLabelMap: Record<TransactionType, string> = {
  [TransactionType.TRANSFER]: '$AUDIO',
  [TransactionType.CHALLENGE_REWARD]: '$AUDIO Reward Earned',
  [TransactionType.TRENDING_REWARD]: 'Trending Competition Award',
  [TransactionType.TIP]: 'Tip',
  [TransactionType.PURCHASE]: 'Purchased $AUDIO'
}

const transactionMethodLabelMap: Record<TransactionMethod, string | null> = {
  [TransactionMethod.COINBASE]: null,
  [TransactionMethod.STRIPE]: null,
  [TransactionMethod.RECEIVE]: 'Received',
  [TransactionMethod.SEND]: 'Sent'
}

type TransactionCell = Cell<TransactionDetails>
type TransactionRow = Row<TransactionDetails>

export type AudioTransactionsTableColumn =
  | 'balance'
  | 'change'
  | 'date'
  | 'transactionType'
  | 'spacer'
  | 'spacer2'

type AudioTransactionsTableProps = {
  columns?: AudioTransactionsTableColumn[]
  data: (TransactionDetails | {})[]
  isVirtualized?: boolean
  loading?: boolean
  onClickRow?: (txDetails: TransactionDetails, index: number) => void
  onSort: (sortMethod: string, sortDirection: string) => void
  fetchMore: (offset: number, limit: number) => void
  tableClassName?: string
  wrapperClassName?: string
  totalRowCount: number
  scrollRef?: React.RefObject<HTMLDivElement>
  fetchBatchSize: number
}

const defaultColumns: AudioTransactionsTableColumn[] = [
  'spacer',
  'transactionType',
  'date',
  'change',
  'balance',
  'spacer2'
]

export const isChangePositive = (tx: TransactionDetails) => {
  return (
    tx.transactionType === TransactionType.PURCHASE ||
    tx.method === TransactionMethod.RECEIVE
  )
}

// Cell Render Functions
const renderTransactionTypeCell = (cellInfo: TransactionCell) => {
  const { transactionType, method } = cellInfo.row.original
  const typeText = transactionTypeLabelMap[transactionType as TransactionType]
  const methodText =
    transactionMethodLabelMap[method as TransactionMethod] ?? ''

  const isTransferType =
    transactionType === TransactionType.TIP ||
    transactionType === TransactionType.TRANSFER
  return (
    <>
      <div className={styles.icon}>
        <AudioTransactionIcon type={transactionType} method={method} />
      </div>
      <span className={styles.typeText}>
        {`${typeText} ${isTransferType ? methodText : ''}`.trim()}
      </span>
    </>
  )
}

const renderBalanceCell = (cellInfo: TransactionCell) => {
  const transaction = cellInfo.row.original
  return formatAudio(transaction.balance)
}

const renderDateCell = (cellInfo: TransactionCell) => {
  const transaction = cellInfo.row.original
  return moment(transaction.date).format('M/D/YY')
}

const renderChangeCell = (cellInfo: TransactionCell) => {
  const tx = cellInfo.row.original
  const isPositive = isChangePositive(tx)
  const { change } = tx
  return (
    <Tooltip text={`${formatAudio(tx.change, 2)} $AUDIO`} mount={'body'}>
      <div
        className={cn(
          styles.changeCell,
          isChangePositive(tx) ? styles.increase : styles.decrease
        )}
      >
        {isPositive ? '' : '-'}
        {formatAudio(change)}
      </div>
    </Tooltip>
  )
}

const isEmptyRow = (row: any) => {
  return Boolean(
    !row?.original?.signature || row?.original?.kind === Kind.EMPTY
  )
}

// Columns
const tableColumnMap = {
  transactionType: {
    id: 'transactionType',
    Header: 'Transaction Type',
    accessor: 'type',
    Cell: renderTransactionTypeCell,
    width: 150,
    disableSortBy: false,
    align: 'left'
  },
  date: {
    id: 'date',
    Header: 'Date',
    accessor: 'date',
    Cell: renderDateCell,
    disableSortBy: false,
    align: 'right'
  },
  change: {
    id: 'change',
    Header: 'Change',
    accessor: 'change',
    Cell: renderChangeCell,
    disableSortBy: true,
    align: 'right'
  },
  balance: {
    id: 'balance',
    Header: 'Balance',
    accessor: 'balance',
    Cell: renderBalanceCell,
    disableSortBy: true,
    align: 'right'
  },
  spacer: {
    id: 'spacer',
    maxWidth: 24,
    minWidth: 24,
    disableSortBy: true,
    disableResizing: true
  },
  spacer2: {
    id: 'spacer2',
    maxWidth: 24,
    minWidth: 24,
    disableSortBy: true,
    disableResizing: true
  }
}

export const AudioTransactionsTable = ({
  columns = defaultColumns,
  data,
  isVirtualized = false,
  loading = false,
  onClickRow,
  onSort,
  fetchMore,
  tableClassName,
  wrapperClassName,
  totalRowCount,
  scrollRef,
  fetchBatchSize
}: AudioTransactionsTableProps) => {
  const tableColumns = useMemo(
    () => columns.map((id) => tableColumnMap[id]),
    [columns]
  )

  const handleClickRow = useCallback(
    (
      _: MouseEvent<HTMLTableRowElement>,
      rowInfo: TransactionRow,
      index: number
    ) => {
      onClickRow?.(rowInfo.original, index)
    },
    [onClickRow]
  )

  const getRowClassName = useCallback(() => '', [])

  return (
    <Table
      wrapperClassName={wrapperClassName}
      tableClassName={tableClassName}
      getRowClassName={getRowClassName}
      columns={tableColumns}
      data={data}
      loading={loading}
      onClickRow={handleClickRow}
      onSort={onSort}
      isEmptyRow={isEmptyRow}
      fetchMore={fetchMore}
      isVirtualized={isVirtualized}
      totalRowCount={totalRowCount}
      scrollRef={scrollRef}
      fetchBatchSize={fetchBatchSize}
    />
  )
}
