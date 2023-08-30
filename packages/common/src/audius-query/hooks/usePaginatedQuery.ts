import { useCallback, useState } from 'react'

import { isEqual } from 'lodash'
import { useCustomCompareEffect } from 'react-use'

import { Status } from 'models/Status'

import { QueryHookOptions, QueryHookResults } from '../types'

export const usePaginatedQuery = <
  Data,
  ArgsType extends { limit: number; offset: number }
>(
  useQueryHook: (
    args: ArgsType,
    options?: QueryHookOptions
  ) => QueryHookResults<Data[]>,
  baseArgs: Omit<ArgsType, 'limit' | 'offset'>,
  options: { pageSize: number } & QueryHookOptions
) => {
  const { pageSize, ...queryHookOptions } = options
  const { disabled } = queryHookOptions
  const [page, setPage] = useState(0)
  const args = {
    ...baseArgs,
    limit: pageSize,
    offset: page * pageSize
  } as ArgsType
  const result = useQueryHook(args, queryHookOptions)

  const loadMore = useCallback(() => {
    if (!disabled) {
      setPage(page + 1)
    }
  }, [disabled, page])

  return {
    ...result,
    loadMore,
    hasMore:
      result.status === Status.IDLE ||
      (!result.data && result.status === Status.LOADING) ||
      result.data?.length === pageSize
  }
}

export const useAllPaginatedQuery = <
  Data,
  ArgsType extends { limit: number; offset: number }
>(
  useQueryHook: (
    args: ArgsType,
    options?: QueryHookOptions
  ) => QueryHookResults<Data[]>,
  baseArgs: Omit<ArgsType, 'limit' | 'offset'>,
  options: { pageSize: number } & QueryHookOptions
) => {
  const [loadingMore, setLoadingMore] = useState(false)
  const { pageSize, ...queryHookOptions } = options
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<Status>(Status.IDLE)
  const [allData, setAllData] = useState<Data[]>([])

  useCustomCompareEffect(
    () => {
      setAllData([])
      setPage(0)
      setLoadingMore(false)
    },
    [baseArgs],
    isEqual
  )

  const args = {
    ...baseArgs,
    limit: pageSize,
    offset: page * pageSize
  } as ArgsType
  const result = useQueryHook(args, queryHookOptions)

  useCustomCompareEffect(
    () => {
      setStatus(result.status)
      if (result.status === Status.ERROR) {
        setLoadingMore(false)
        return
      }
      if (result.status === Status.SUCCESS) {
        setAllData((allData) => [...allData, ...result.data])
        setLoadingMore(false)
      }
    },
    [result.status, args],
    isEqual
  )

  const notError = result.status !== Status.ERROR
  const notStillLoadingCurrentPage =
    !loadingMore && !(result.status === Status.LOADING)
  const notStarted = result.status === Status.IDLE && allData.length === 0
  const hasNotFetched = !result.data && result.status !== Status.SUCCESS
  const fetchedFullPreviousPage = result.data?.length === pageSize

  const hasMore =
    notError &&
    notStillLoadingCurrentPage &&
    (notStarted || hasNotFetched || fetchedFullPreviousPage)

  const loadMore = useCallback(() => {
    if (!notStillLoadingCurrentPage) {
      return
    }
    setLoadingMore(true)
    setPage(page + 1)
  }, [notStillLoadingCurrentPage, page])
  return {
    ...result,
    // TODO: add another status for reloading
    status: allData?.length > 0 ? Status.SUCCESS : status,
    data: allData,
    isLoadingMore: !notStillLoadingCurrentPage,
    loadMore,
    hasMore
  }
}
