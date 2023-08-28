import { PurchaseRow } from './types'

export const isEmptyRow = (row?: PurchaseRow) => {
  return !row?.original.signature
}
