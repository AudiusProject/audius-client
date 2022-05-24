import { createSelector } from '@reduxjs/toolkit'
import { StringWei } from 'common/models/Wallet'
import { CommonState } from 'common/store'
import { Nullable } from 'common/utils/typeUtils'
import { stringWeiToBN } from 'common/utils/wallet'

const getAccountBalanceStr = (state: CommonState): Nullable<StringWei> => {
  return state.wallet.balance ?? null
}
export const getAccountBalance = createSelector(
  getAccountBalanceStr,
  (balance) => balance ? stringWeiToBN(balance) : null
)

const getAccountTotalBalanceStr = (state: CommonState): Nullable<StringWei> => {
  return state.wallet.totalBalance ?? null
}
export const getAccountTotalBalance = createSelector(
  getAccountTotalBalanceStr,
  (totalBalance) => totalBalance ? stringWeiToBN(totalBalance) : null
)

export const getLocalBalanceDidChange = (state: CommonState): boolean => {
  return state.wallet.localBalanceDidChange
}
