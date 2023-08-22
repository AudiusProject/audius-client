import { CreateChatModalState } from './create-chat-modal'
import { BaseModalState } from './createModal'
import { InboxUnavailableModalState } from './inbox-unavailable-modal'
import { LeavingAudiusModalState } from './leaving-audius-modal'

export type Modals =
  | 'TiersExplainer'
  | 'TrendingRewardsExplainer'
  | 'ChallengeRewardsExplainer'
  | 'LinkSocialRewardsExplainer'
  | 'APIRewardsExplainer'
  | 'TransferAudioMobileWarning'
  | 'MobileConnectWalletsDrawer'
  | 'MobileEditCollectiblesDrawer'
  | 'Share'
  | 'ShareSoundToTikTok'
  | 'HCaptcha'
  | 'BrowserPushPermissionConfirmation'
  | 'AudioBreakdown'
  | 'CollectibleDetails'
  | 'DeactivateAccountConfirmation'
  | 'FeedFilter'
  | 'TrendingGenreSelection'
  | 'SocialProof'
  | 'EditFolder'
  | 'SignOutConfirmation'
  | 'Overflow'
  | 'AddToPlaylist'
  | 'DeletePlaylistConfirmation'
  | 'FeatureFlagOverride'
  | 'BuyAudio'
  | 'BuyAudioRecovery'
  | 'TransactionDetails'
  | 'VipDiscord'
  | 'StripeOnRamp'
  | 'InboxSettings'
  | 'LockedContent'
  | 'PlaybackRate'
  | 'ProfileActions'
  | 'PublishPlaylistConfirmation'
  | 'AiAttributionSettings'
  | 'DuplicateAddConfirmation'
  | 'PremiumContentPurchase'
  | 'CreateChatModal'
  | 'InboxUnavailableModal'
  | 'LeavingAudiusModal'

export type BasicModalsState = {
  [modal in Modals]: BaseModalState
}

export type StatefulModalsState = {
  CreateChatModal: CreateChatModalState
  InboxUnavailableModal: InboxUnavailableModalState
  LeavingAudiusModal: LeavingAudiusModalState
}

export type ModalsState = BasicModalsState & StatefulModalsState
