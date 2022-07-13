import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export enum CoinbasePayStatus {
  IDLE,
  LOADING,
  READY,
  OPENED,
  SUCCEEDED,
  EXITED
}

const initialState: {
  coinbasePayStatus: CoinbasePayStatus
} = {
  coinbasePayStatus: CoinbasePayStatus.IDLE
}

const slice = createSlice({
  name: 'ui/coinbase-pay-pixel',
  initialState,
  reducers: {
    init: (
      state,
      action: PayloadAction<{
        destinationWallet: string
        amount: number
        assets: string[]
      }>
    ) => {},
    open: () => {},
    destroy: () => {},
    statusUpdate: (
      state,
      action: PayloadAction<{ status: CoinbasePayStatus }>
    ) => {
      state.coinbasePayStatus = action.payload.status
    }
  }
})

export const { init, open, destroy, statusUpdate } = slice.actions

export default slice.reducer
