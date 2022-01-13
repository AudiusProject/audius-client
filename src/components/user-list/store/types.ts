import { ID } from 'common/models/Identifiers'

export type UserListStoreState = {
  tag: string
  page: number
  pageSize: number
  userIds: ID[]
  hasMore: boolean
  loading: boolean
}

export type FetchUserIdsSaga = (
  currentPage: number,
  pageSize: number
) => Generator<any, { userIds: number[]; hasMore: boolean }, any>
