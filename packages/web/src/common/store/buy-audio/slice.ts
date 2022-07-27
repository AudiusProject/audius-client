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

type QuoteSucceededPayload = {
  inputTokenSymbol: JupiterTokenSymbol
  outputTokenSymbol: JupiterTokenSymbol
  inputUiAmount: string
  outputUiAmount: string
}

type QuoteFailedPayload = {
  inputTokenSymbol: JupiterTokenSymbol
  outputTokenSymbol: JupiterTokenSymbol
}

type QuoteStatusInfo = {
  inputUiAmount?: string
  outputUiAmount?: string
  status: QuoteStatus
}

type BuyAudioState = {
  flow: Flow
  quoteStatuses: Record<
    JupiterTokenSymbol,
    Record<JupiterTokenSymbol, QuoteStatusInfo>
  >
  exchangeStatus: {
    status: ExchangeStatus
    outputAmount?: string
  }
}

const initialState: BuyAudioState = {
  flow: Flow.COINBASE_PAY,
  quoteStatuses: {},
  exchangeStatus: { status: ExchangeStatus.IDLE }
}

const initQuoteStatusIfNecessary = (
  state: BuyAudioState,
  inputTokenSymbol: JupiterTokenSymbol,
  outputTokenSymbol: JupiterTokenSymbol
) => {
  if (!state.quoteStatuses[inputTokenSymbol]?.[outputTokenSymbol]) {
    state.quoteStatuses[inputTokenSymbol] = {
      ...state.quoteStatuses[inputTokenSymbol],
      [outputTokenSymbol]: {
        status: QuoteStatus.IDLE
      }
    }
  }
  return state
}

const slice = createSlice({
  name: 'ui/buy-audio',
  initialState,
  reducers: {
    exchangeAfterBalanceChange: (state, _: PayloadAction<ExchangePayload>) => {
      state.exchangeStatus.status = ExchangeStatus.WAITING
    },
    exchange: (state, _: PayloadAction<ExchangePayload>) => {
      state.exchangeStatus.status = ExchangeStatus.EXCHANGING
    },
    exchangeSucceeded: (
      state,
      action: PayloadAction<ExchangeSucceededPayload>
    ) => {
      state.exchangeStatus.status = ExchangeStatus.SUCCEEDED
      state.exchangeStatus.outputAmount = action.payload.outputAmount
    },
    exchangeFailed: (state) => {
      state.exchangeStatus.status = ExchangeStatus.FAILED
    },
    quote: (
      state,
      {
        payload: { inputTokenSymbol, outputTokenSymbol }
      }: PayloadAction<QuotePayload>
    ) => {
      state = initQuoteStatusIfNecessary(
        state,
        inputTokenSymbol,
        outputTokenSymbol
      )
      state.quoteStatuses[inputTokenSymbol][outputTokenSymbol].status =
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
      }: PayloadAction<QuoteSucceededPayload>
    ) => {
      state.quoteStatuses[inputTokenSymbol][outputTokenSymbol].inputUiAmount =
        inputUiAmount
      state.quoteStatuses[inputTokenSymbol][outputTokenSymbol].outputUiAmount =
        outputUiAmount
      state.quoteStatuses[inputTokenSymbol][outputTokenSymbol].status =
        QuoteStatus.SUCCEEDED
    },
    quoteFailed: (
      state,
      {
        payload: { inputTokenSymbol, outputTokenSymbol }
      }: PayloadAction<QuoteFailedPayload>
    ) => {
      state.quoteStatuses[inputTokenSymbol][outputTokenSymbol].status =
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
