import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { JupiterTokenSymbol } from 'common/store/buy-audio/constants'

export enum Flow {
  COINBASE_PAY = 'COINBASE_PAY'
}

export enum QuoteStatus {
  IDLE = 'IDLE',
  QUOTING = 'QUOTING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED'
}

export enum ExchangeStatus {
  IDLE = 'IDLE',
  WAITING = 'WAITING',
  EXCHANGING = 'EXCHANGING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED'
}

type ExchangePayload = {
  inputTokenSymbol: JupiterTokenSymbol
  outputTokenSymbol: JupiterTokenSymbol
  inputAmount: number
  slippage?: number
}

type ExchangeSucceededPayload = {
  inputTokenSymbol: JupiterTokenSymbol
  outputTokenSymbol: JupiterTokenSymbol
  /** BNWei string */
  outputAmount: string
}

type QuotePayload = ExchangePayload & {
  padForSlippage?: boolean
  forceFetch?: boolean
}

type BuyAudioState = {
  flow: Flow
  swaps: Record<
    JupiterTokenSymbol,
    Record<
      JupiterTokenSymbol,
      {
        inputUiAmount?: string
        outputUiAmount?: string
        quoteStatus: QuoteStatus
        exchangeStatus: ExchangeStatus
      }
    >
  >
}

const initialState: BuyAudioState = {
  flow: Flow.COINBASE_PAY,
  swaps: {}
}

const initSwapStateIfNecessary = (
  state: BuyAudioState,
  inputTokenSymbol: JupiterTokenSymbol,
  outputTokenSymbol: JupiterTokenSymbol
) => {
  if (
    !state.swaps[inputTokenSymbol] ||
    !state.swaps[inputTokenSymbol][outputTokenSymbol]
  ) {
    state.swaps[inputTokenSymbol] = {
      ...state.swaps[inputTokenSymbol],
      [outputTokenSymbol]: {
        quoteStatus: QuoteStatus.IDLE,
        exchangeStatus: ExchangeStatus.IDLE
      }
    }
  }
  return state
}

const slice = createSlice({
  name: 'ui/buy-audio',
  initialState,
  reducers: {
    exchangeAfterBalanceChange: (
      state,
      {
        payload: { inputTokenSymbol, outputTokenSymbol }
      }: PayloadAction<ExchangePayload>
    ) => {
      state = initSwapStateIfNecessary(
        state,
        inputTokenSymbol,
        outputTokenSymbol
      )
      state.swaps[inputTokenSymbol][outputTokenSymbol].exchangeStatus =
        ExchangeStatus.WAITING
    },
    exchange: (
      state,
      {
        payload: { inputTokenSymbol, outputTokenSymbol }
      }: PayloadAction<ExchangePayload>
    ) => {
      state = initSwapStateIfNecessary(
        state,
        inputTokenSymbol,
        outputTokenSymbol
      )
      state.swaps[inputTokenSymbol][outputTokenSymbol].exchangeStatus =
        ExchangeStatus.EXCHANGING
    },
    exchangeSucceeded: (
      state,
      {
        payload: { inputTokenSymbol, outputTokenSymbol }
      }: PayloadAction<ExchangeSucceededPayload>
    ) => {
      state.swaps[inputTokenSymbol][outputTokenSymbol].exchangeStatus =
        ExchangeStatus.SUCCEEDED
    },
    exchangeFailed: (
      state,
      {
        payload: { inputTokenSymbol, outputTokenSymbol }
      }: PayloadAction<ExchangePayload>
    ) => {
      state.swaps[inputTokenSymbol][outputTokenSymbol].exchangeStatus =
        ExchangeStatus.FAILED
    },
    quote: (
      state,
      {
        payload: { inputTokenSymbol, outputTokenSymbol }
      }: PayloadAction<QuotePayload>
    ) => {
      state = initSwapStateIfNecessary(
        state,
        inputTokenSymbol,
        outputTokenSymbol
      )
      state.swaps[inputTokenSymbol][outputTokenSymbol].quoteStatus =
        QuoteStatus.QUOTING
    },
    quoteSucceeded: (
      state,
      {
        payload: {
          inputTokenSymbol,
          outputTokenSymbol,
          inputUiAmount,
          outputUiAmount
        }
      }: PayloadAction<{
        inputTokenSymbol: JupiterTokenSymbol
        outputTokenSymbol: JupiterTokenSymbol
        inputUiAmount: string
        outputUiAmount: string
      }>
    ) => {
      state.swaps[inputTokenSymbol][outputTokenSymbol].inputUiAmount =
        inputUiAmount
      state.swaps[inputTokenSymbol][outputTokenSymbol].outputUiAmount =
        outputUiAmount
      state.swaps[inputTokenSymbol][outputTokenSymbol].quoteStatus =
        QuoteStatus.SUCCEEDED
    },
    quoteFailed: (
      state,
      {
        payload: { inputTokenSymbol, outputTokenSymbol }
      }: PayloadAction<{
        inputTokenSymbol: JupiterTokenSymbol
        outputTokenSymbol: JupiterTokenSymbol
      }>
    ) => {
      state.swaps[inputTokenSymbol][outputTokenSymbol].quoteStatus =
        QuoteStatus.FAILED
    }
  }
})

export const {
  exchangeAfterBalanceChange,
  exchange,
  exchangeSucceeded,
  exchangeFailed,
  quote,
  quoteSucceeded,
  quoteFailed
} = slice.actions

export default slice.reducer
