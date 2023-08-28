import { useCallback, useContext, useEffect, useState } from 'react'

import {
  FeatureFlags,
  Status,
  USDCPurchaseDetails,
  accountSelectors,
  statusIsNotFinalized,
  useAllPaginatedQuery,
  useGetPurchases
} from '@audius/common'
import { full } from '@audius/sdk'
import { push as pushRoute } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import Header from 'components/header/desktop/Header'
import Page from 'components/page/Page'
import { useFlag } from 'hooks/useRemoteConfig'
import { MainContentContext } from 'pages/MainContentContext'
import NotFoundPage from 'pages/not-found-page/NotFoundPage'
import { useSelector } from 'utils/reducer'
import { FEED_PAGE } from 'utils/route'

import styles from './PurchasesPage.module.css'
import {
  PurchasesTable,
  PurchasesTableSortDirection,
  PurchasesTableSortMethod
} from './PurchasesTable'
import { NoPurchasesContent } from './components/NoPurchasesContent'

const { getUserId } = accountSelectors

const messages = {
  pageTitle: 'Purchase History',
  pageDescription: 'View your purchase history',
  noPurchasesHeader: `You haven't bought anything yet.`,
  noPurchasesBody: 'Once you make a purchase, it will show up here.',
  findSongs: 'Find Songs',
  headerText: 'Your Purchases'
}

const TRANSACTIONS_BATCH_SIZE = 50

const sortMethods: {
  [k in PurchasesTableSortMethod]: full.GetPurchasesSortMethodEnum
} = {
  contentId: full.GetPurchasesSortMethodEnum.ContentTitle,
  createdAt: full.GetPurchasesSortMethodEnum.Date,
  sellerUserId: full.GetPurchasesSortMethodEnum.ArtistName
}

const sortDirections: {
  [k in PurchasesTableSortDirection]: full.GetPurchasesSortDirectionEnum
} = {
  asc: full.GetPurchasesSortDirectionEnum.Asc,
  desc: full.GetPurchasesSortDirectionEnum.Desc
}

const DEFAULT_SORT_METHOD = full.GetPurchasesSortMethodEnum.Date
const DEFAULT_SORT_DIRECTION = full.GetPurchasesSortDirectionEnum.Desc

const NoPurchases = () => {
  const dispatch = useDispatch()
  const handleClickFindSongs = useCallback(() => {
    dispatch(pushRoute(FEED_PAGE))
  }, [dispatch])

  return (
    <NoPurchasesContent
      headerText={messages.noPurchasesHeader}
      bodyText={messages.noPurchasesBody}
      ctaText={messages.findSongs}
      onCTAClicked={handleClickFindSongs}
    />
  )
}

/**
 * Fetches and renders a table of purchases for the currently logged in user
 * */
const RenderPurchasesPage = () => {
  const userId = useSelector(getUserId)
  // Defaults: sort method = date, sort direction = desc
  const [sortMethod, setSortMethod] =
    useState<full.GetPurchasesSortMethodEnum>(DEFAULT_SORT_METHOD)
  const [sortDirection, setSortDirection] =
    useState<full.GetPurchasesSortDirectionEnum>(DEFAULT_SORT_DIRECTION)
  const { mainContentRef } = useContext(MainContentContext)

  const [count, setCount] = useState(0)

  const {
    status,
    data: purchases
    // hasMore,
    // loadMore
  } = useAllPaginatedQuery(
    useGetPurchases,
    { userId, sortMethod, sortDirection },
    { disabled: !userId, pageSize: TRANSACTIONS_BATCH_SIZE }
  )

  // TODO: Should fetch tracks and users before rendering the table

  // Mocking count functionality until we have are returning it from
  // the API. This stabilizes the sort behavior of the table
  useEffect(() => {
    if (status === Status.SUCCESS) {
      setCount(purchases.length)
    }
  }, [status, purchases])

  const onSort = useCallback(
    (
      method: PurchasesTableSortMethod,
      direction: PurchasesTableSortDirection
    ) => {
      setSortMethod(sortMethods[method] ?? DEFAULT_SORT_METHOD)
      setSortDirection(sortDirections[direction] ?? DEFAULT_SORT_DIRECTION)
    },
    []
  )

  // TODO: Remove this short circuit once count is implemented
  const fetchMore = useCallback(() => {}, [])
  // const fetchMore = useCallback(() => {
  //   if (hasMore) {
  //     loadMore()
  //   }
  // }, [hasMore, loadMore])

  const onClickRow = useCallback((txDetails: USDCPurchaseDetails) => {
    // TODO: Show details modal on row click
  }, [])

  const isEmpty = status === Status.SUCCESS && purchases.length === 0
  const isLoading = statusIsNotFinalized(status)

  return (
    <Page
      title={messages.pageTitle}
      description={messages.pageDescription}
      header={<Header primary={messages.headerText} />}
    >
      <div className={styles.container}>
        {isEmpty ? (
          <NoPurchases />
        ) : (
          <PurchasesTable
            key='purchases'
            data={purchases}
            loading={isLoading}
            onSort={onSort}
            onClickRow={onClickRow}
            fetchMore={fetchMore}
            isVirtualized={true}
            scrollRef={mainContentRef}
            // TODO: When count endpoint is implemented, update this to enable
            // loading beyond the first batch
            totalRowCount={count}
            fetchBatchSize={TRANSACTIONS_BATCH_SIZE}
          />
        )}
      </div>
    </Page>
  )
}

export const PurchasesPage = () => {
  const { isLoaded, isEnabled } = useFlag(FeatureFlags.USDC_PURCHASES)

  // Return null if flag isn't loaded yet to prevent flash of 404 page
  if (!isLoaded) return null
  return isEnabled ? <RenderPurchasesPage /> : <NotFoundPage />
}
