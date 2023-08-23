import { useCallback, useContext } from 'react'

import {
  Status,
  USDCPurchaseDetails,
  accountSelectors,
  statusIsNotFinalized,
  useAllPaginatedQuery,
  useGetPurchases
} from '@audius/common'
import {
  HarmonyButton,
  HarmonyButtonSize,
  HarmonyButtonType,
  IconCart
} from '@audius/stems'
import { push as pushRoute } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import { Icon } from 'components/Icon'
import Header from 'components/header/desktop/Header'
import Page from 'components/page/Page'
import { Tile } from 'components/tile'
import { Text } from 'components/typography'
import { MainContentContext } from 'pages/MainContentContext'
import { useSelector } from 'utils/reducer'
import { FEED_PAGE } from 'utils/route'

import styles from './PurchasesPage.module.css'
import { PurchasesTable } from './PurchasesTable'

const { getUserId } = accountSelectors

const messages = {
  pageTitle: 'Purchase History',
  pageDescription: 'View your purchase history',
  noPurchasesHeader: `You haven't bought anything yet.`,
  noPurchasesBody: 'Once you make a purchase, it will show up here.',
  findSongs: 'Find Songs',
  headerText: 'Your Purchases'
}

// TODO: Use higher value after testing
const TRANSACTIONS_BATCH_SIZE = 5

// TODO: Match mock, button goes to
const NoPurchases = () => {
  const dispatch = useDispatch()
  const handleClickFindSongs = useCallback(() => {
    dispatch(pushRoute(FEED_PAGE))
  }, [dispatch])

  return (
    <Tile elevation='far' size='large' className={styles.noPurchasesTile}>
      <div className={styles.noPurchasesContent}>
        <Icon icon={IconCart} color='neutralLight4' size='xxxLarge' />
        <Text variant='heading' size='small'>
          {messages.noPurchasesHeader}
        </Text>
        <Text variant='body' size='large'>
          {messages.noPurchasesBody}
        </Text>
      </div>
      <HarmonyButton
        variant={HarmonyButtonType.SECONDARY}
        size={HarmonyButtonSize.SMALL}
        text={messages.findSongs}
        onClick={handleClickFindSongs}
      />
    </Tile>
  )
}

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
