import { useCallback, useContext, useEffect, useState } from 'react'

import {
  FeatureFlags,
  Status,
  USDCPurchaseDetails,
  accountSelectors,
  statusIsNotFinalized,
  useAllPaginatedQuery,
  useGetSales
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
import { UPLOAD_PAGE } from 'utils/route'

import styles from './SalesPage.module.css'
import {
  SalesTable,
  SalesTableSortDirection,
  SalesTableSortMethod
} from './SalesTable'
import { NoPurchasesContent } from './components/NoPurchasesContent'

const { getUserId } = accountSelectors

const messages = {
  pageTitle: 'Sales History',
  pageDescription: 'View your sales history',
  noSalesHeader: `You haven't sold anything yet.`,
  noSalesBody: 'Once you make a sale, it will show up here.',
  upload: 'Upload',
  headerText: 'Your Sales'
}

const TRANSACTIONS_BATCH_SIZE = 50

const sortMethods: {
  [k in SalesTableSortMethod]: full.GetSalesSortMethodEnum
} = {
  contentId: full.GetSalesSortMethodEnum.ContentTitle,
  createdAt: full.GetSalesSortMethodEnum.Date
}

const sortDirections: {
  [k in SalesTableSortDirection]: full.GetSalesSortDirectionEnum
} = {
  asc: full.GetSalesSortDirectionEnum.Asc,
  desc: full.GetSalesSortDirectionEnum.Desc
}

const DEFAULT_SORT_METHOD = full.GetSalesSortMethodEnum.Date
const DEFAULT_SORT_DIRECTION = full.GetSalesSortDirectionEnum.Desc

const NoSales = () => {
  const dispatch = useDispatch()
  const handleClickUpload = useCallback(() => {
    dispatch(pushRoute(UPLOAD_PAGE))
  }, [dispatch])
  return (
    <NoPurchasesContent
      headerText={messages.noSalesHeader}
      bodyText={messages.noSalesBody}
      ctaText={messages.upload}
      onCTAClicked={handleClickUpload}
    />
  )
}

/**
 * Fetches and renders a table of Sales for the currently logged in user
 * */
const RenderSalesPage = () => {
  const userId = useSelector(getUserId)
  // Defaults: sort method = date, sort direction = desc
  const [sortMethod, setSortMethod] =
    useState<full.GetSalesSortMethodEnum>(DEFAULT_SORT_METHOD)
  const [sortDirection, setSortDirection] =
    useState<full.GetSalesSortDirectionEnum>(DEFAULT_SORT_DIRECTION)
  const { mainContentRef } = useContext(MainContentContext)

  const [count, setCount] = useState(0)

  const {
    status,
    data: purchases
    // hasMore,
    // loadMore
  } = useAllPaginatedQuery(
    useGetSales,
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
    (method: SalesTableSortMethod, direction: SalesTableSortDirection) => {
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
          <NoSales />
        ) : (
          <SalesTable
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

export const SalesPage = () => {
  const { isLoaded, isEnabled } = useFlag(FeatureFlags.USDC_PURCHASES)

  // Return null if flag isn't loaded yet to prevent flash of 404 page
  if (!isLoaded) return null
  return isEnabled ? <RenderSalesPage /> : <NotFoundPage />
}
