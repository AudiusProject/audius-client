import { useCallback, useContext, useEffect, useState } from 'react'

import {
  Status,
  USDCPurchaseDetails,
  accountSelectors,
  statusIsNotFinalized,
  useAllPaginatedQuery,
  useGetPurchases
} from '@audius/common'
import { full } from '@audius/sdk'
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
import {
  PurchasesTable,
  PurchasesTableSortDirection,
  PurchasesTableSortMethod
} from './PurchasesTable'

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
const TRANSACTIONS_BATCH_SIZE = 50

const sortMethods: {
  [k in PurchasesTableSortMethod]: full.GetPurchasesSortMethodEnum
} = {
  contentName: full.GetPurchasesSortMethodEnum.ContentTitle,
  date: full.GetPurchasesSortMethodEnum.Date,
  artist: full.GetPurchasesSortMethodEnum.ArtistName
}

const sortDirections: {
  [k in PurchasesTableSortDirection]: full.GetPurchasesSortDirectionEnum
} = {
  asc: full.GetPurchasesSortDirectionEnum.Asc,
  desc: full.GetPurchasesSortDirectionEnum.Desc
}

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

// TODO: Move this into a helper hook and/or down into the table.
const empty = Array.from({ length: TRANSACTIONS_BATCH_SIZE }).map(() => ({}))

/**
 * Fetches and renders a table of purchases for the currently logged in user
 * */
export const PurchasesPage = () => {
  const userId = useSelector(getUserId)
  // Defaults: sort method = date, sort direction = desc
  const [sortMethod, setSortMethod] = useState<full.GetPurchasesSortMethodEnum>(
    full.GetPurchasesSortMethodEnum.Date
  )
  const [sortDirection, setSortDirection] =
    useState<full.GetPurchasesSortDirectionEnum>(
      full.GetPurchasesSortDirectionEnum.Desc
    )
  const { mainContentRef } = useContext(MainContentContext)

  const {
    status,
    data: transactions,
    hasMore,
    loadMore
  } = useAllPaginatedQuery(
    useGetPurchases,
    { userId, sortMethod, sortDirection },
    { disabled: !userId, pageSize: TRANSACTIONS_BATCH_SIZE }
  )

  const [rows, setRows] = useState<any[]>([...empty])

  useEffect(() => {
    if (hasMore) {
      setRows([...transactions, ...empty] as any)
    } else {
      setRows(transactions)
    }
  }, [transactions, hasMore])

  // TODO: This doesn't seem to work?
  const onSort = useCallback(
    (
      method: PurchasesTableSortMethod,
      direction: PurchasesTableSortDirection
    ) => {
      setSortMethod(sortMethods[method])
      setSortDirection(sortDirections[direction])
    },
    []
  )

  const fetchMore = useCallback(() => {
    if (hasMore) {
      loadMore()
    }
  }, [hasMore, loadMore])

  const onClickRow = useCallback((txDetails: USDCPurchaseDetails) => {
    // TODO: Show details modal on row click
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
            data={status === Status.SUCCESS ? (rows as any) : []}
            loading={isLoading}
            onSort={onSort}
            onClickRow={onClickRow}
            fetchMore={fetchMore}
            isVirtualized={true}
            scrollRef={mainContentRef}
            totalRowCount={rows?.length}
            fetchBatchSize={TRANSACTIONS_BATCH_SIZE}
          />
        )}
      </div>
    </Page>
  )
}
