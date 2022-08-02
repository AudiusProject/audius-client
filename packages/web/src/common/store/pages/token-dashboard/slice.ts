import {
  Chain,
  BNWei,
  StringWei,
  WalletAddress,
  Nullable
} from '@audius/common'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import {
  AssociatedWallets,
  ConfirmRemoveWalletAction,
  ModalState,
  TokenDashboardState
} from 'common/store/pages/token-dashboard/types'

const initialState: TokenDashboardState = {
  modalState: null,
  modalVisible: false,
  discordCode: null,
  associatedWallets: {
    status: null,
    connectedEthWallets: null,
    confirmingWallet: {
      wallet: null,
      chain: null,
      balance: null,
      collectibleCount: null
    },
    connectedSolWallets: null,
    errorMessage: null,
    removeWallet: {
      wallet: null,
      chain: null,
      status: null
    }
  }
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
        payload: { amount, wallet, chain }
      }: PayloadAction<{
        amount: StringWei
        wallet: WalletAddress
        chain: Chain
      }>
    ) => {
      const newState: ModalState = {
        stage: 'SEND' as const,
        flowState: {
          stage: 'AWAITING_CONFIRMATION',
          amount,
          recipientWallet: wallet,
          chain
        }
      }
      state.modalState = newState
    },
    transferEthAudioToSolWAudio: (state) => {
      if (
        state.modalState?.stage !== 'SEND' ||
        state.modalState.flowState.stage !== 'SENDING'
      )
        return

      state.modalState.flowState = {
        stage: 'AWAITING_CONVERTING_ETH_AUDIO_TO_SOL',
        recipientWallet: state.modalState.flowState.recipientWallet,
        amount: state.modalState.flowState.amount,
        chain: state.modalState.flowState.chain
      }
    },
    confirmSend: (state) => {
      if (
        state.modalState?.stage !== 'SEND' ||
        (state.modalState.flowState.stage !== 'AWAITING_CONFIRMATION' &&
          state.modalState.flowState.stage !==
            'AWAITING_CONVERTING_ETH_AUDIO_TO_SOL')
      )
        return

      state.modalState.flowState = {
        stage: 'SENDING',
        recipientWallet: state.modalState.flowState.recipientWallet,
        amount: state.modalState.flowState.amount,
        chain: state.modalState.flowState.chain
      }
    },
    pressReceive: (state) => {
      state.modalState = {
        stage: 'RECEIVE',
        flowState: { stage: 'KEY_DISPLAY' }
      }
      state.modalVisible = true
    },
    pressDiscord: (state) => {
      state.modalState = { stage: 'DISCORD_CODE' }
      state.modalVisible = true
    },
    setDiscordCode: (
      state,
      { payload: { code } }: PayloadAction<{ code: Nullable<string> }>
    ) => {
      state.discordCode = code
    },

    // Saga Actions

    pressSend: () => {},
    fetchAssociatedWallets: () => {},
    setAssociatedWallets: (
      state,
      {
        payload: { associatedWallets, chain }
      }: PayloadAction<{ associatedWallets: AssociatedWallets; chain: Chain }>
    ) => {
      if (chain === Chain.Sol) {
        state.associatedWallets.connectedSolWallets = associatedWallets
      } else if (chain === Chain.Eth) {
        state.associatedWallets.connectedEthWallets = associatedWallets
      }
      state.associatedWallets.confirmingWallet = {
        wallet: null,
        chain: null,
        balance: null,
        collectibleCount: null
      }
      state.associatedWallets.status = null
    },
    pressConnectWallets: (state) => {
      state.modalState = {
        stage: 'CONNECT_WALLETS',
        flowState: { stage: 'ADD_WALLET' }
      }
      state.modalVisible = true
      state.associatedWallets.removeWallet.wallet = null
      state.associatedWallets.errorMessage = null
    },
    connectNewWallet: (state) => {
      state.associatedWallets.status = 'Connecting'
      state.associatedWallets.errorMessage = null
    },
    setIsConnectingWallet: (
      state,
      {
        payload: { wallet, chain, balance, collectibleCount }
      }: PayloadAction<{
        wallet: string
        chain: Chain
        balance: BNWei
        collectibleCount: number
      }>
    ) => {
      // is connecting
      state.associatedWallets.confirmingWallet.wallet = wallet
      state.associatedWallets.confirmingWallet.chain = chain
      state.associatedWallets.confirmingWallet.balance = balance
      state.associatedWallets.confirmingWallet.collectibleCount =
        collectibleCount
    },
    setWalletAddedConfirmed: (
      state,
      {
        payload: { wallet, balance, chain, collectibleCount }
      }: PayloadAction<{
        wallet: string
        balance: BNWei
        chain: Chain
        collectibleCount: number
      }>
    ) => {
      if (chain === Chain.Sol) {
        state.associatedWallets.connectedSolWallets = (
          state.associatedWallets.connectedSolWallets || []
        ).concat({ address: wallet, balance, collectibleCount })
      } else if (chain === Chain.Eth) {
        state.associatedWallets.connectedEthWallets = (
          state.associatedWallets.connectedEthWallets || []
        ).concat({ address: wallet, balance, collectibleCount })
      }
      state.associatedWallets.confirmingWallet = {
        wallet: null,
        chain: null,
        balance: null,
        collectibleCount: null
      }
      state.associatedWallets.status = 'Confirmed'
    },
    requestRemoveWallet: (
      state,
      {
        payload: { wallet, chain }
      }: PayloadAction<{ wallet: WalletAddress; chain: Chain }>
    ) => {
      state.associatedWallets.removeWallet.wallet = wallet
      state.associatedWallets.removeWallet.chain = chain
      state.modalState = {
        stage: 'CONNECT_WALLETS',
        flowState: { stage: 'REMOVE_WALLET' }
      }
      state.associatedWallets.errorMessage = null
    },
    confirmRemoveWallet: (
      state,
      { payload: { wallet, chain } }: ConfirmRemoveWalletAction
    ) => {
      state.associatedWallets.removeWallet.status = 'Confirming'
      state.modalState = {
        stage: 'CONNECT_WALLETS',
        flowState: { stage: 'ADD_WALLET' }
      }
    },
    removeWallet: (
      state,
      {
        payload: { wallet, chain }
      }: PayloadAction<{ wallet: WalletAddress; chain: Chain }>
    ) => {
      state.associatedWallets.removeWallet.status = null
      state.associatedWallets.removeWallet.wallet = null
      state.associatedWallets.removeWallet.chain = null
      if (chain === Chain.Sol) {
        state.associatedWallets.connectedSolWallets =
          state.associatedWallets.connectedSolWallets?.filter(
            (a) => a.address !== wallet
          ) ?? null
      } else if (chain === Chain.Eth) {
        state.associatedWallets.connectedEthWallets =
          state.associatedWallets.connectedEthWallets?.filter(
            (a) => a.address !== wallet
          ) ?? null
      }
    },
    updateWalletError: (
      state,
      {
        payload: { errorMessage }
      }: PayloadAction<{ errorMessage: string | null }>
    ) => {
      state.associatedWallets.errorMessage = errorMessage
      state.associatedWallets.removeWallet.status = null
      state.associatedWallets.removeWallet.wallet = null
      state.associatedWallets.removeWallet.chain = null
      state.associatedWallets.confirmingWallet = {
        wallet: null,
        chain: null,
        balance: null,
        collectibleCount: null
      }
      state.associatedWallets.status = null
    },
    preloadWalletProviders: (state) => {},
    resetStatus: (state) => {
      state.associatedWallets.status = null
    }
  }
})

export const {
  setModalState,
  setModalVisibility,
  pressReceive,
  pressSend,
  inputSendData,
  confirmSend,
  pressDiscord,
  setDiscordCode,
  fetchAssociatedWallets,
  setWalletAddedConfirmed,
  setAssociatedWallets,
  connectNewWallet,
  pressConnectWallets,
  setIsConnectingWallet,
  requestRemoveWallet,
  confirmRemoveWallet,
  removeWallet,
  updateWalletError,
  preloadWalletProviders,
  resetStatus,
  transferEthAudioToSolWAudio
} = slice.actions

export default slice
