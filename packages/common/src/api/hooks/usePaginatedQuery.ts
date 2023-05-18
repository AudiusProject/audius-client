import { useEffect, useState } from 'react'

import { Status } from 'models/Status'

import { QueryHookResults } from '../types'
import { getKeyFromFetchArgs } from '../utils'

export const usePaginatedQuery = <
  Data extends [],
  ArgsType extends { limit: number; offset: number },
  HookType extends (args: ArgsType) => QueryHookResults<Data>
>(
  useQueryHook: HookType,
  baseArgs: Exclude<ArgsType, 'limit' | 'offset'>,
  pageSize: number
) => {
  const [page, setPage] = useState(0)
  const args = { ...baseArgs, limit: pageSize, offset: page * pageSize }
  const result = useQueryHook(args)
  return {
    ...result,
    loadMore: () => setPage(page + 1),
    hasMore:
      result.status === Status.IDLE ||
      (!result.data && result.status === Status.LOADING) ||
      result.data?.length === pageSize
  }
}

export const useAllPaginatedQuery = <
  Data,
  ArgsType extends { limit: number; offset: number },
  HookType extends (args: ArgsType) => QueryHookResults<Data[]>
>(
  useQueryHook: HookType,
  baseArgs: Omit<ArgsType, 'limit' | 'offset'>,
  pageSize: number
) => {
  // TODO: per key page counter
  const [page, setPage] = useState(0)
  const [allData, setAllData] = useState<Record<string, Data[] | undefined>>({})

  const args = {
    ...baseArgs,
    limit: pageSize,
    offset: page * pageSize
  } as ArgsType
  const result = useQueryHook(args)
  const key = getKeyFromFetchArgs(baseArgs)

  useEffect(() => {
    if (result.status !== Status.SUCCESS) return
    setAllData((allData) => {
      allData[key] = [...(allData[key] ?? []), ...result.data]
      return allData
    })
  }, [result.status, result.data, key])

  const accumulatedData = allData[key] ?? result.data ?? null
  return {
    ...result,
    // TODO: add another status for reloading
    status:
      accumulatedData && accumulatedData?.length > 0
        ? Status.SUCCESS
        : result.status,
    isLoadingMore:
      result.status === Status.LOADING &&
      accumulatedData &&
      accumulatedData?.length > 0,
    data: accumulatedData,
    loadMore: () => {
      console.log('LOADED MORE')
      setPage(page + 1)
    },
    hasMore:
      result.status === Status.IDLE ||
      (!result.data && result.status === Status.LOADING) ||
      result.data?.length === pageSize
  }
}
