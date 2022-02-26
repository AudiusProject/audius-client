import { combineReducers } from 'redux'

import Cache from 'common/models/Cache'
import { Collection } from 'common/models/Collection'
import Kind from 'common/models/Kind'
import accountSlice from 'common/store/account/reducer'
import averageColorReducer from 'common/store/average-color/slice'
import collectionsErrorSagas from 'common/store/cache/collections/errorSagas'
import collectionsReducer from 'common/store/cache/collections/reducer'
import collectionsSagas from 'common/store/cache/collections/sagas'
import { asCache } from 'common/store/cache/reducer'
import cacheSagas from 'common/store/cache/sagas'
import tracksReducer from 'common/store/cache/tracks/reducer'
import tracksSagas from 'common/store/cache/tracks/sagas'
import { TracksCacheState } from 'common/store/cache/tracks/types'
import usersReducer from 'common/store/cache/users/reducer'
import usersSagas from 'common/store/cache/users/sagas'
import { UsersCacheState } from 'common/store/cache/users/types'
import { sagas as castSagas } from 'common/store/cast/sagas'
import cast from 'common/store/cast/slice'
import audioRewardsSlice from 'common/store/pages/audio-rewards/slice'
import exploreCollectionsReducer from 'common/store/pages/explore/exploreCollections/slice'
import explorePageReducer from 'common/store/pages/explore/slice'
import feed from 'common/store/pages/feed/reducer'
import { FeedPageState } from 'common/store/pages/feed/types'
import profileReducer from 'common/store/pages/profile/reducer'
import { ProfilePageState } from 'common/store/pages/profile/types'
import savedPageReducer from 'common/store/pages/saved-page/reducer'
import searchResults from 'common/store/pages/search-results/reducer'
import { SearchPageState } from 'common/store/pages/search-results/types'
import tokenDashboardSlice from 'common/store/pages/token-dashboard/slice'
import track from 'common/store/pages/track/reducer'
import TrackPageState from 'common/store/pages/track/types'
import trendingUnderground from 'common/store/pages/trending-underground/slice'
import trending from 'common/store/pages/trending/reducer'
import { TrendingPageState } from 'common/store/pages/trending/types'
import queue from 'common/store/queue/slice'
import remoteConfigSagas from 'common/store/remote-config/sagas'
import solanaReducer from 'common/store/solana/slice'
import stemsUpload from 'common/store/stems-upload/slice'
import addToPlaylistReducer, {
  AddToPlaylistState
} from 'common/store/ui/add-to-playlist/reducer'
import collectibleDetailsReducer, {
  CollectibleDetailsState
} from 'common/store/ui/collectible-details/slice'
import createPlaylistModalReducer from 'common/store/ui/createPlaylistModal/reducer'
import { CreatePlaylistModalState } from 'common/store/ui/createPlaylistModal/types'
import deletePlaylistConfirmationReducer from 'common/store/ui/delete-playlist-confirmation-modal/reducers'
import { DeletePlaylistConfirmationModalState } from 'common/store/ui/delete-playlist-confirmation-modal/types'
import mobileOverflowModalReducer from 'common/store/ui/mobile-overflow-menu/slice'
import { MobileOverflowModalState } from 'common/store/ui/mobile-overflow-menu/types'
import mobileUploadDrawerReducer, {
  MobileUploadDrawerState
} from 'common/store/ui/mobile-upload-drawer/slice'
import modalsReducer, { ModalsState } from 'common/store/ui/modals/slice'
import nowPlayingReducer, {
  NowPlayingState
} from 'common/store/ui/now-playing/slice'
import shareModalReducer from 'common/store/ui/share-modal/slice'
import { ShareModalState } from 'common/store/ui/share-modal/types'
import shareSoundToTikTokModalReducer from 'common/store/ui/share-sound-to-tiktok-modal/slice'
import { ShareSoundToTikTokModalState } from 'common/store/ui/share-sound-to-tiktok-modal/types'
import theme from 'common/store/ui/theme/reducer'
import { ThemeState } from 'common/store/ui/theme/types'
import toastReducer, { ToastState } from 'common/store/ui/toast/slice'
import favoritesUserListReducer from 'common/store/user-list/favorites/reducers'
import followersUserListReducer from 'common/store/user-list/followers/reducers'
import followingUserListReducer from 'common/store/user-list/following/reducers'
import repostsUserListReducer from 'common/store/user-list/reposts/reducers'
import wallet from 'common/store/wallet/slice'

// In the future, these state slices will live in packages/common.
// For now they live in the web client. As features get migrated to RN
// relevant state slices should be added here. Eventually they will be pulled into
// packages/common and the mobile client will no longer be dependent on the web client

export type CommonStoreContext = {
  getLocalStorageItem: (key: string) => Promise<string | null>
  setLocalStorageItem: (key: string, value: string) => Promise<void>
}

/**
 * A function that creates common reducers. The function takes
 * a CommonStoreContext as input such that platforms (native and web)
 * may specify system-level APIs, e.g. local storage.
 * @param ctx
 * @returns an object of all reducers to be used with `combineReducers`
 */
export const reducers = (ctx: CommonStoreContext) => ({
  account: accountSlice.reducer,

  // Cache
  collections: asCache(collectionsReducer, Kind.COLLECTIONS),
  tracks: asCache(tracksReducer, Kind.TRACKS),
  users: asCache(usersReducer, Kind.USERS),

  // Playback
  queue,

  // Wallet
  wallet,

  // Cast
  cast,

  // UI
  ui: combineReducers({
    averageColor: averageColorReducer,
    addToPlaylist: addToPlaylistReducer,
    createPlaylistModal: createPlaylistModalReducer,
    collectibleDetails: collectibleDetailsReducer,
    deletePlaylistConfirmationModal: deletePlaylistConfirmationReducer,
    mobileOverflowModal: mobileOverflowModalReducer,
    mobileUploadDrawer: mobileUploadDrawerReducer,
    modals: modalsReducer,
    nowPlaying: nowPlayingReducer,
    shareSoundToTikTokModal: shareSoundToTikTokModalReducer,
    shareModal: shareModalReducer,
    toast: toastReducer,
    userList: combineReducers({
      followers: followersUserListReducer,
      following: followingUserListReducer,
      reposts: repostsUserListReducer,
      favorites: favoritesUserListReducer
    }),
    theme
  }),

  // Pages
  pages: combineReducers({
    audioRewards: audioRewardsSlice.reducer,
    feed,
    explore: explorePageReducer,
    exploreCollections: exploreCollectionsReducer,
    profile: profileReducer,
    savedPage: savedPageReducer,
    searchResults,
    tokenDashboard: tokenDashboardSlice.reducer,
    track,
    trending,
    trendingUnderground
  }),

  // Solana
  solana: solanaReducer,

  stemsUpload
})

/**
 * A function that creates common sagas. The function takes
 * a CommonStoreContext as input such that platforms (native and web)
 * may specify system-level APIs, e.g. local storage.
 * @param ctx
 * @returns an object of all sagas to be yielded
 */
export const sagas = (ctx: CommonStoreContext) => ({
  cache: cacheSagas,
  collectionsError: collectionsErrorSagas,
  collections: collectionsSagas,
  tracks: tracksSagas,
  users: usersSagas,
  remoteConfig: remoteConfigSagas,
  cast: castSagas(ctx)

  // TODO:
  // pull in the following from web
  // once AudiusBackend and dependencies are migrated
  // common/store/pages/explore/exploreCollections/sagas.ts
  // common/store/pages/explore/sagas.ts
  // components/add-to-playlist/store/sagas.ts
  // components/share-sound-to-tiktok-modal/store/sagas.ts
  // store/social/tracks/sagas.ts
  // store/social/users/sagas.ts
  // store/social/collections/sagas.ts
  // pages/audio-rewards-page/store/sagas.ts
  // store/wallet/sagas.ts
  // store/lineup/sagas.js
  // pages/feed/store/lineups/feed/sagas.js
  // pages/feed/store/sagas.js
  // pages/track/store/lineups/tracks/sagas.js
  // pages/track/store/sagas.js
  // store/ui/stemsUpload/sagas.ts
  // pages/user-list/followers/sagas.ts
  // pages/user-list/following/sagas.ts
  // pages/user-list/reposts/sagas.ts
  // pages/user-list/favorites/sagas.ts
  // pages/explore-page/store/sagas.ts
  // pages/explore-page/store/exploreCollections/sagas.ts
  // store/solana/sagas.ts
  // pages/trending-page/store/sagas.ts
  // pages/trending-page/store/lineups/trending/sagas.ts
  // pages/trending-underground-page/store/lineups/tracks/sagas.ts
  // pages/trending-underground-page/store/sagas.ts
  // store/application/ui/theme/sagas.ts
  // pages/search-page/store/sagas.ts
  // pages/search-page/store/lineups/tracks/sagas.ts
  //
  // pull in the following from web
  // once the player and dependencies are migrated
  // store/queue/sagas.ts
})

export type CommonState = {
  account: ReturnType<typeof accountSlice.reducer>

  // Cache
  collections: Cache<Collection>
  tracks: TracksCacheState
  users: UsersCacheState

  // Playback
  queue: ReturnType<typeof queue>

  // Wallet
  wallet: ReturnType<typeof wallet>

  // Cast
  cast: ReturnType<typeof cast>

  ui: {
    averageColor: ReturnType<typeof averageColorReducer>
    addToPlaylist: AddToPlaylistState
    createPlaylistModal: CreatePlaylistModalState
    collectibleDetails: CollectibleDetailsState
    deletePlaylistConfirmationModal: DeletePlaylistConfirmationModalState
    mobileOverflowModal: MobileOverflowModalState
    mobileUploadDrawer: MobileUploadDrawerState
    modals: ModalsState
    nowPlaying: NowPlayingState
    shareSoundToTikTokModal: ShareSoundToTikTokModalState
    shareModal: ShareModalState
    toast: ToastState
    userList: {
      followers: ReturnType<typeof followersUserListReducer>
      following: ReturnType<typeof followingUserListReducer>
      reposts: ReturnType<typeof repostsUserListReducer>
      favorites: ReturnType<typeof favoritesUserListReducer>
    }
    theme: ThemeState
  }

  pages: {
    audioRewards: ReturnType<typeof audioRewardsSlice.reducer>
    feed: FeedPageState
    explore: ReturnType<typeof explorePageReducer>
    exploreCollections: ReturnType<typeof exploreCollectionsReducer>
    tokenDashboard: ReturnType<typeof tokenDashboardSlice.reducer>
    track: TrackPageState
    profile: ProfilePageState
    savedPage: ReturnType<typeof savedPageReducer>
    searchResults: SearchPageState
    trending: TrendingPageState
    trendingUnderground: ReturnType<typeof trendingUnderground>
  }

  solana: ReturnType<typeof solanaReducer>

  stemsUpload: ReturnType<typeof stemsUpload>
}
