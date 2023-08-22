import { useCallback, useContext } from 'react'

import {
  Status,
  USDCPurchaseDetails,
  accountSelectors,
  statusIsNotFinalized,
  useAllPaginatedQuery,
  useGetPurchases
} from '@audius/common'

import Header from 'components/header/desktop/Header'
import Page from 'components/page/Page'
import { MainContentContext } from 'pages/MainContentContext'
import { useSelector } from 'utils/reducer'

import styles from './PurchasesPage.module.css'
import { PurchasesTable } from './PurchasesTable'

const { getUserId } = accountSelectors

const messages = {
  pageTitle: 'Purchase History',
  pageDescription: 'View your purchase history',
  emptyTableText: `You haven't bought anything yet.`,
  emptyTableSecondaryText: 'Once you make a purchase, it will show up here.',
  headerText: 'Your Purchases'
}

// TODO: Use higher value after testing
const TRANSACTIONS_BATCH_SIZE = 5

// TODO: Match mock, button goes to
const NoPurchases = () => <div className={styles.emptyTableContainer}></div>

export const PurchasesPage = () => {
  const userId = useSelector(getUserId)
  // const [sortMethod, setSortMethod] =
  //   useState<full.GetAudioTransactionHistorySortMethodEnum>(
  //     full.GetAudioTransactionHistorySortMethodEnum.Date
  //   )
  // const [sortDirection, setSortDirection] =
  //   useState<full.GetAudioTransactionHistorySortDirectionEnum>(
  //     full.GetAudioTransactionHistorySortDirectionEnum.Desc
  //   )
  const { mainContentRef } = useContext(MainContentContext)

  const {
    status,
    data: transactions,
    hasMore,
    loadMore
  } = useAllPaginatedQuery(
    useGetPurchases,
    { userId },
    { disabled: !userId, pageSize: TRANSACTIONS_BATCH_SIZE }
  )
  // const dispatch = useDispatch()
  // const setVisibility = useSetVisibility()

  // TODO: Fetch total count?

  // useEffect(() => {
  //   dispatch(fetchAudioTransactionsCount())
  // }, [dispatch])

  // Defaults: sort method = date, sort direction = desc
  const onSort = useCallback(
    (sortMethodInner: string, sortDirectionInner: string) => {
      // const sortMethodRes =
      //   sortMethodInner === 'type'
      //     ? full.GetAudioTransactionHistorySortMethodEnum.TransactionType
      //     : full.GetAudioTransactionHistorySortMethodEnum.Date
      // setSortMethod(sortMethodRes)
      // const sortDirectionRes =
      //   sortDirectionInner === 'asc'
      //     ? full.GetAudioTransactionHistorySortDirectionEnum.Asc
      //     : full.GetAudioTransactionHistorySortDirectionEnum.Desc
      // setSortDirection(sortDirectionRes)
    },
    []
  )

  // TODO: Do we actually need this or is loadMore() safe to call directly?
  const fetchMore = useCallback(() => {
    if (hasMore) {
      loadMore()
    }
  }, [hasMore, loadMore])

  const onClickRow = useCallback((txDetails: USDCPurchaseDetails) => {
    // dispatch(
    //   fetchTransactionDetailsSucceeded({
    //     transactionId: txDetails.signature,
    //     transactionDetails: txDetails
    //   })
    // )
    // if (txDetails.transactionType === TransactionType.PURCHASE) {
    //   dispatch(
    //     fetchAudioTransactionMetadata({
    //       txDetails
    //     })
    //   )
    // }
    // setVisibility('TransactionDetails')(true)
  }, [])

  const isEmpty = transactions && transactions.length === 0
  const isLoading = statusIsNotFinalized(status)

  return (
    <Page
      title={messages.pageTitle}
      description={messages.pageDescription}
      header={<Header primary={messages.headerText} />}
    >
      <div className={styles.container}>
        {isEmpty && !isLoading ? (
          <NoPurchases />
        ) : (
          <PurchasesTable
            key='purchases'
            data={status === Status.SUCCESS ? transactions : []}
            loading={isLoading}
            onSort={onSort}
            onClickRow={onClickRow}
            fetchMore={fetchMore}
            isVirtualized={true}
            // totalRowCount={audioTransactionsCount}
            scrollRef={mainContentRef}
            fetchBatchSize={TRANSACTIONS_BATCH_SIZE}
          />
        )}
      </div>
    </Page>
  )
}
