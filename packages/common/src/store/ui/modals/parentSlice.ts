import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { BasicModalsState, Modals } from './types'

export const initialState: BasicModalsState = {
  TiersExplainer: { isOpen: false },
  TrendingRewardsExplainer: { isOpen: false },
  ChallengeRewardsExplainer: { isOpen: false },
  LinkSocialRewardsExplainer: { isOpen: false },
  APIRewardsExplainer: { isOpen: false },
  TransferAudioMobileWarning: { isOpen: false },
  MobileConnectWalletsDrawer: { isOpen: false },
  MobileEditCollectiblesDrawer: { isOpen: false },
  Share: { isOpen: false },
  ShareSoundToTikTok: { isOpen: false },
  HCaptcha: { isOpen: false },
  BrowserPushPermissionConfirmation: { isOpen: false },
  AudioBreakdown: { isOpen: false },
  CollectibleDetails: { isOpen: false },
  DeactivateAccountConfirmation: { isOpen: false },
  FeedFilter: { isOpen: false },
  TrendingGenreSelection: { isOpen: false },
  SocialProof: { isOpen: false },
  EditFolder: { isOpen: false },
  SignOutConfirmation: { isOpen: false },
  Overflow: { isOpen: false },
  AddToPlaylist: { isOpen: false },
  DeletePlaylistConfirmation: { isOpen: false },
  DuplicateAddConfirmation: { isOpen: false },
  FeatureFlagOverride: { isOpen: false },
  BuyAudio: { isOpen: false },
  BuyAudioRecovery: { isOpen: false },
  TransactionDetails: { isOpen: false },
  VipDiscord: { isOpen: false },
  StripeOnRamp: { isOpen: false },
  InboxSettings: { isOpen: false },
  LockedContent: { isOpen: false },
  PlaybackRate: { isOpen: false },
  ProfileActions: { isOpen: false },
  PublishPlaylistConfirmation: { isOpen: false },
  AiAttributionSettings: { isOpen: false },
  PremiumContentPurchase: { isOpen: false },
  CreateChatModal: { isOpen: false },
  LeavingAudiusModal: { isOpen: false },
  InboxUnavailableModal: { isOpen: false },
  UploadConfirmation: { isOpen: false },
  WithdrawUSDCModal: { isOpen: false },
  USDCPurchaseDetailsModal: { isOpen: false }
}

const slice = createSlice({
  name: 'application/ui/modals',
  initialState,
  reducers: {
    setVisibility: (
      state,
      action: PayloadAction<{
        modal: Modals
        visible: boolean | 'closing'
      }>
    ) => {
      const { modal, visible } = action.payload
      state[modal].isOpen = visible
    }
  }
})

export const { setVisibility } = slice.actions

export const actions = slice.actions

export default slice.reducer
