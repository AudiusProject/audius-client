import {
  profilePageReducer as profile,
  queueReducer as queue,
  remoteConfigReducer as remoteConfig,
  reducers as clientStoreReducers
} from '@audius/common'
import { connectRouter } from 'connected-react-router'
import { History } from 'history'
import { combineReducers } from 'redux'

import backend from 'common/store/backend/reducer'
import buyAudioReducer from 'common/store/buy-audio/slice'
import confirmer from 'common/store/confirmer/reducer'
import serviceSelection from 'common/store/service-selection/slice'
import embedModal from 'components/embed-modal/store/reducers'
import firstUploadModal from 'components/first-upload-modal/store/slice'
import musicConfetti from 'components/music-confetti/store/slice'
import passwordReset from 'components/password-reset/store/reducer'
import remixSettingsModal from 'components/remix-settings-modal/store/slice'
import searchBar from 'components/search-bar/store/reducer'
import unfollowConfirmation from 'components/unfollow-confirmation-modal/store/reducers'
import dashboard from 'pages/artist-dashboard-page/store/reducer'
import deactivateAccount from 'pages/deactivate-account-page/store/slice'
import deleted from 'pages/deleted-page/store/slice'
import upload from 'pages/upload-page/store/reducer'
import visualizer from 'pages/visualizer/store/slice'
import appCTAModal from 'store/application/ui/app-cta-modal/slice'
import cookieBanner from 'store/application/ui/cookieBanner/reducer'
import editFolderModal from 'store/application/ui/editFolderModal/slice'
import editPlaylistModal from 'store/application/ui/editPlaylistModal/slice'
import editTrackModal from 'store/application/ui/editTrackModal/reducer'
import mobileKeyboard from 'store/application/ui/mobileKeyboard/reducer'
import scrollLock from 'store/application/ui/scrollLock/reducer'
import setAsArtistPickConfirmation from 'store/application/ui/setAsArtistPickConfirmation/reducer'
import userListModal from 'store/application/ui/userListModal/slice'
import dragndrop from 'store/dragndrop/reducer'
import player from 'store/player/slice'
import playlistLibrary from 'store/playlist-library/slice'

export const commonStoreReducers = clientStoreReducers()

const createRootReducer = (routeHistory: History) =>
  combineReducers({
    // Common store
    ...commonStoreReducers,
    // TODO: should be in common
    backend,

    // Router
    router: connectRouter(routeHistory),

    // Config
    confirmer,

    // Account
    passwordReset,
    playlistLibrary,

    // UI Functions
    dragndrop,

    // Pages
    upload,
    profile,
    dashboard,
    searchBar,
    serviceSelection,

    // Playback
    queue,
    player,

    // Remote config/flags
    remoteConfig,
    ui: combineReducers({
      ...commonStoreReducers.ui,
      buyAudio: buyAudioReducer
    }),
    application: combineReducers({
      ui: combineReducers({
        appCTAModal,
        cookieBanner,
        deactivateAccount,
        editFolderModal,
        editPlaylistModal,
        editTrackModal,
        embedModal,
        firstUploadModal,
        mobileKeyboard,
        musicConfetti,
        remixSettingsModal,
        scrollLock,
        setAsArtistPickConfirmation,
        userListModal,
        visualizer
      }),
      pages: combineReducers({
        deleted,
        unfollowConfirmation
      })
    })
  })

export default createRootReducer
