import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import BN from 'bn.js'
import { AppState } from 'store/types'
import { StringBN, WalletAddress } from 'store/wallet/slice'
import { Nullable } from 'utils/typeUtils'

export type ClaimState =
  | { stage: 'CLAIMING' }
  | { stage: 'SUCCESS' }
  | { stage: 'ERROR'; error: string }

type ReceiveState = { stage: 'KEY_DISPLAY' }
type SendingState =
  | { stage: 'INPUT' }
  | {
      stage: 'AWAITING_CONFIRMATION'
      amount: StringBN
      recipientWallet: string
    }
  | {
      stage: 'CONFIRMED_SEND'
      amount: StringBN
      recipientWallet: WalletAddress
    }
  | { stage: 'ERROR'; error: string }

export type ModalState = Nullable<
  | { stage: 'CLAIM'; claimState: ClaimState }
  | { stage: 'RECEIVE'; recieveState: ReceiveState }
  | { stage: 'SEND'; sendingState: SendingState }
>

type TokenDashboardState = {
  modalState: Nullable<ModalState>
  modalVisible: boolean
}

const initialState: TokenDashboardState = {
  modalState: null,
  modalVisible: false
}

const slice = createSlice({
  name: 'token-dashboard',
  initialState,
  reducers: {
    setModalState: (
      state,
      {
        payload: { modalState }
      }: PayloadAction<{ modalState: Nullable<ModalState> }>
    ) => {
      state.modalState = modalState
    },
    setModalVisibility: (
      state,
      { payload: { isVisible } }: PayloadAction<{ isVisible: boolean }>
    ) => {
      state.modalVisible = isVisible
    },
    inputSendData: (
      state,
      {
        payload: { amount, wallet }
      }: PayloadAction<{ amount: StringBN; wallet: WalletAddress }>
    ) => {
      const newState: ModalState = {
        stage: 'SEND' as 'SEND',
        sendingState: {
          stage: 'AWAITING_CONFIRMATION',
          amount,
          recipientWallet: wallet
        }
      }
      state.modalState = newState
    },
    confirmSend: state => {
      if (
        state.modalState?.stage !== 'SEND' ||
        state.modalState.sendingState.stage !== 'AWAITING_CONFIRMATION'
      )
        return

      state.modalState.sendingState = {
        stage: 'CONFIRMED_SEND',
        recipientWallet: state.modalState.sendingState.recipientWallet,
        amount: state.modalState.sendingState.amount
      }
    },

    // Saga Actions

    pressClaim: () => {},
    pressReceive: () => {},
    pressSend: () => {}
  }
})

// Selectors

export const getSendData = (state: AppState) => {
  const modalState = state.application.pages.tokenDashboard.modalState
  if (
    !(
      modalState?.stage === 'SEND' &&
      modalState.sendingState.stage === 'CONFIRMED_SEND'
    )
  )
    return null
  const { recipientWallet, amount } = modalState.sendingState
  return { recipientWallet, amount: new BN(amount) }
}

export const {
  setModalState,
  setModalVisibility,
  pressClaim,
  pressReceive,
  pressSend,
  inputSendData,
  confirmSend
} = slice.actions

export default slice.reducer
