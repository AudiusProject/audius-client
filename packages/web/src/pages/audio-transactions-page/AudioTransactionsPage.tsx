import { useEffect, useState, useContext } from 'react'

import {
  TransactionDetails,
  TransactionType,
  audioTransactionsPageActions,
  audioTransactionsPageSelectors,
  transactionDetailsActions
} from '@audius/common'
import { full } from '@audius/sdk'
import { useDispatch } from 'react-redux'

import { useSetVisibility } from 'common/hooks/useModalState'
import { AudioTransactionsTable } from 'components/audio-transactions-table'
import Header from 'components/header/desktop/Header'
import Page from 'components/page/Page'
import EmptyTable from 'components/tracks-table/EmptyTable'
import { MainContentContext } from 'pages/MainContentContext'
import { useSelector } from 'utils/reducer'

import styles from './AudioTransactionsPage.module.css'
const {
  fetchAudioTransactions,
  setAudioTransactions,
  fetchAudioTransactionMetadata,
  fetchAudioTransactionsCount
} = audioTransactionsPageActions
const { getAudioTransactions, getAudioTransactionsCount } =
  audioTransactionsPageSelectors
const { fetchTransactionDetailsSucceeded } = transactionDetailsActions
const {
  GetAudioTransactionHistorySortMethodEnum,
  GetAudioTransactionHistorySortDirectionEnum
} = full

const messages = {
  pageTitle: 'AudioTransactions',
  pageDescription: 'View your transactions history',
  emptyTableText: 'You don’t have any $AUDIO transactions yet.',
  emptyTableSecondaryText: 'Once you have, this is where you’ll find them!',
  headerText: '$AUDIO Transactions'
}

const AUDIO_TRANSACTIONS_BATCH_SIZE = 50

export const AudioTransactionsPage = () => {
  const [offset, setOffset] = useState(0)
  const [limit, setLimit] = useState(AUDIO_TRANSACTIONS_BATCH_SIZE)
  const [sortMethod, setSortMethod] = useState(
    GetAudioTransactionHistorySortMethodEnum.Date
  )
  const [sortDirection, setSortDirection] = useState(
    GetAudioTransactionHistorySortDirectionEnum.Desc
  )
  const { mainContentRef } = useContext(MainContentContext)
  const dispatch = useDispatch()
  const setVisibility = useSetVisibility()

  const audioTransactions: (TransactionDetails | {})[] =
    useSelector(getAudioTransactions)
  const audioTransactionsCount: number = useSelector(getAudioTransactionsCount)

  useEffect(() => {
    dispatch(fetchAudioTransactionsCount())
  }, [dispatch])

  // Reset audio transactions data on sort change, but not on offset and
  // limit change to allow pagination.
  useEffect(() => {
    dispatch(
      setAudioTransactions({
        tx_details: Array(audioTransactionsCount ?? 0).fill({}) as {}[],
        offset: 0
      })
    )
  }, [dispatch, sortMethod, sortDirection, audioTransactionsCount])

  useEffect(() => {
    dispatch(
      fetchAudioTransactions({ offset, limit, sortMethod, sortDirection })
    )
  }, [dispatch, offset, limit, sortMethod, sortDirection])

  // Defaults: sort method = date, sort direction = desc
  const onSort = (sortMethodInner: string, sortDirectionInner: string) => {
    const sortMethodRes =
      sortMethodInner === 'type'
        ? GetAudioTransactionHistorySortMethodEnum.TransactionType
        : GetAudioTransactionHistorySortMethodEnum.Date
    setSortMethod(sortMethodRes)
    const sortDirectionRes =
      sortDirectionInner === 'asc'
        ? GetAudioTransactionHistorySortDirectionEnum.Asc
        : GetAudioTransactionHistorySortDirectionEnum.Desc
    setSortDirection(sortDirectionRes)
  }

  const fetchMore = (offset: number, limit: number) => {
    setOffset(offset)
    setLimit(limit)
  }

  const onClickRow = (
    _: any,
    { original: tx_details }: { original: TransactionDetails }
  ) => {
    dispatch(
      fetchTransactionDetailsSucceeded({
        transactionId: tx_details.signature,
        transactionDetails: tx_details
      })
    )
    console.log('REED tx_type: ', tx_details)
    if (tx_details.transactionType === TransactionType.PURCHASE) {
      dispatch(
        fetchAudioTransactionMetadata({
          tx_details
        })
      )
    }
    setVisibility('TransactionDetails')(true)
  }

  const tableLoading = audioTransactions.every(
    (transaction: any) => !transaction.signature
  )
  const isEmpty = audioTransactions.length === 0

  return (
    <Page
      title={messages.pageTitle}
      description={messages.pageDescription}
      header={<Header primary={messages.headerText} />}
    >
      <div className={styles.bodyWrapper}>
        {isEmpty && !tableLoading ? (
          <EmptyTable
            primaryText={messages.emptyTableText}
            secondaryText={messages.emptyTableSecondaryText}
          />
        ) : (
          <AudioTransactionsTable
            key='audioTransactions'
            data={audioTransactions}
            loading={tableLoading}
            onSort={onSort}
            onClickRow={onClickRow}
            fetchMore={fetchMore}
            isVirtualized={true}
            totalRowCount={audioTransactionsCount}
            scrollRef={mainContentRef}
            fetchBatchSize={AUDIO_TRANSACTIONS_BATCH_SIZE}
          />
        )}
      </div>
    </Page>
  )
}
