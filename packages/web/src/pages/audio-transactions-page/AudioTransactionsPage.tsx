import { useCallback, useEffect, useState, useContext } from 'react'

import {
  useAllPaginatedQuery,
  useGetAudioTransactionHistory,
  TransactionDetails,
  TransactionType,
  audioTransactionsPageActions,
  audioTransactionsPageSelectors,
  transactionDetailsActions,
  statusIsNotFinalized
} from '@audius/common'
import { full } from '@audius/sdk'
import { IconCaretRight } from '@audius/stems'
import { useDispatch } from 'react-redux'

import { useSetVisibility } from 'common/hooks/useModalState'
import { AudioTransactionsTable } from 'components/audio-transactions-table'
import Header from 'components/header/desktop/Header'
import Page from 'components/page/Page'
import EmptyTable from 'components/tracks-table/EmptyTable'
import { MainContentContext } from 'pages/MainContentContext'
import { useSelector } from 'utils/reducer'

import styles from './AudioTransactionsPage.module.css'
const { fetchAudioTransactionMetadata, fetchAudioTransactionsCount } =
  audioTransactionsPageActions
const { getAudioTransactionsCount, getAudioTransactionsCountStatus } =
  audioTransactionsPageSelectors
const { fetchTransactionDetailsSucceeded } = transactionDetailsActions

const messages = {
  pageTitle: 'Audio Transactions History',
  pageDescription: 'View your transactions history',
  emptyTableText: 'You don’t have any $AUDIO transactions yet.',
  emptyTableSecondaryText: 'Once you have, this is where you’ll find them!',
  headerText: '$AUDIO Transactions',
  disclaimer:
    'Transactions history does not include balances from linked wallets',
  moreInfo: 'More Info'
}

const AUDIO_TRANSACTIONS_BATCH_SIZE = 2

const Disclaimer = () => {
  const setVisibility = useSetVisibility()
  return (
    <div className={styles.container}>
      <span className={styles.disclaimerMessage}>{messages.disclaimer}</span>
      <div
        className={styles.moreInfoContainer}
        onClick={() => setVisibility('AudioBreakdown')(true)}
      >
        <span className={styles.moreInfo}>{messages.moreInfo}</span>
        <IconCaretRight className={styles.iconCaretRight} />
      </div>
    </div>
  )
}

export const AudioTransactionsPage = () => {
  const [sortMethod, setSortMethod] =
    useState<full.GetAudioTransactionHistorySortMethodEnum>(
      full.GetAudioTransactionHistorySortMethodEnum.Date
    )
  const [sortDirection, setSortDirection] =
    useState<full.GetAudioTransactionHistorySortDirectionEnum>(
      full.GetAudioTransactionHistorySortDirectionEnum.Desc
    )
  const { mainContentRef } = useContext(MainContentContext)
  const dispatch = useDispatch()
  const setVisibility = useSetVisibility()

  const audioTransactionsCount: number = useSelector(getAudioTransactionsCount)
  const audioTransactionsCountStatus = useSelector(
    getAudioTransactionsCountStatus
  )

  useEffect(() => {
    dispatch(fetchAudioTransactionsCount())
  }, [dispatch])

  const {
    data: audioTransactions,
    status,
    loadMore
  } = useAllPaginatedQuery(
    useGetAudioTransactionHistory,
    {
      sortMethod,
      sortDirection
    },
    AUDIO_TRANSACTIONS_BATCH_SIZE
  )

  // Defaults: sort method = date, sort direction = desc
  const onSort = useCallback(
    (sortMethodInner: string, sortDirectionInner: string) => {
      const sortMethodRes =
        sortMethodInner === 'type'
          ? full.GetAudioTransactionHistorySortMethodEnum.TransactionType
          : full.GetAudioTransactionHistorySortMethodEnum.Date
      setSortMethod(sortMethodRes)
      const sortDirectionRes =
        sortDirectionInner === 'asc'
          ? full.GetAudioTransactionHistorySortDirectionEnum.Asc
          : full.GetAudioTransactionHistorySortDirectionEnum.Desc
      setSortDirection(sortDirectionRes)
    },
    [setSortMethod, setSortDirection]
  )

  const onClickRow = useCallback(
    (txDetails: TransactionDetails) => {
      dispatch(
        fetchTransactionDetailsSucceeded({
          transactionId: txDetails.signature,
          transactionDetails: txDetails
        })
      )
      if (txDetails.transactionType === TransactionType.PURCHASE) {
        dispatch(
          fetchAudioTransactionMetadata({
            txDetails
          })
        )
      }
      setVisibility('TransactionDetails')(true)
    },
    [dispatch, setVisibility]
  )

  const tableLoading =
    statusIsNotFinalized(status) ||
    statusIsNotFinalized(audioTransactionsCountStatus)
  const isEmpty = audioTransactions.length === 0

  return (
    <Page
      title={messages.pageTitle}
      description={messages.pageDescription}
      header={<Header primary={messages.headerText} />}
    >
      <div className={styles.bodyWrapper}>
        <Disclaimer />
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
            fetchMore={loadMore}
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
