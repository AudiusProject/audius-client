import { useEffect, useState } from 'react'

import { Status } from 'models/Status'

import { QueryHookResults } from '../types'

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
      result.data?.length < pageSize
  }
}

export const useAllPaginatedQuery = <
  Data extends [],
  ArgsType extends { limit: number; offset: number },
  HookType extends (args: ArgsType) => QueryHookResults<Data>
>(
  useQueryHook: HookType,
  baseArgs: Omit<ArgsType, 'limit' | 'offset'>,
  pageSize: number
) => {
  const [page, setPage] = useState(0)
  const [allData, setAllData] = useState([])
  const args = {
    ...baseArgs,
    limit: pageSize,
    offset: page * pageSize
  } as ArgsType
  const result = useQueryHook(args)
  useEffect(() => {
    const { status, data } = result
    if (status !== Status.SUCCESS) return
    setAllData((allData) => [...allData, ...data])
  }, [result])

  useEffect(() => {
    setAllData([])
  }, [baseArgs])

  return {
    ...result,
    data: allData,
    loadMore: () => setPage(page + 1),
    hasMore:
      result.status === Status.IDLE ||
      (!result.data && result.status === Status.LOADING) ||
      result.data?.length < pageSize
  }
}
