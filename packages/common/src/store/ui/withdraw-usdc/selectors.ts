import { CommonState } from 'store/commonStore'

export const getWithdrawDestinationAddress = (state: CommonState) => {
  return state.withdrawUSDC.destinationAddress
}

export const getWithdrawDestinationAddressError = (state: CommonState) => {
  return state.withdrawUSDC.destinationError
}

export const getWithdrawAmount = (state: CommonState) => {
  return state.withdrawUSDC.amount
}

export const getWithdrawAmountError = (state: CommonState) => {
  return state.withdrawUSDC.amountError
}

export const getWithdrawStatus = (state: CommonState) => {
  return state.withdrawUSDC.withdrawStatus
}
