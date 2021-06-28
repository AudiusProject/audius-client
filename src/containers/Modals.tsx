import React from 'react'

import DeletePlaylistConfirmationModal from 'containers/delete-playlist-confirmation-modal/DeletePlaylistConfirmationModal'
import EditPlaylistModal from 'containers/edit-playlist/desktop/EditPlaylistModal'
import EditTrackModal from 'containers/edit-track/EditTrackModal'
import FirstUploadModal from 'containers/first-upload-modal/FirstUploadModal'
import PasswordResetModal from 'containers/password-reset/PasswordResetModal'
import ServiceSelectionModal from 'containers/service-selection/ServiceSelectionModal'
import ConnectedMobileOverflowModal from 'containers/track-overflow-modal/ConnectedMobileOverflowModal'
import UnfollowConfirmationModal from 'containers/unfollow-confirmation-modal/UnfollowConfirmationModal'
import UnloadDialog from 'containers/unload-dialog/UnloadDialog'
import ConnectedUserListModal from 'containers/user-list-modal/ConnectedUserListModal'
import Client from 'models/Client'
import { getClient } from 'utils/clientUtil'

import AppCTAModal from './app-cta-modal/AppCTAModal'
import RewardsModals from './audio-rewards-page/components/modals/RewardsModals'
import BrowserPushConfirmationModal from './browser-push-confirmation-modal/BrowserPushConfirmationModal'
import EmbedModal from './embed-modal/EmbedModal'
import TierExplainerModal from './user-badges/TierExplainerModal'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

const Modals = () => {
  const client = getClient()
  const isMobileClient = client === Client.MOBILE

  return (
    <>
      <ServiceSelectionModal />
      <EditTrackModal />
      <PasswordResetModal />
      <FirstUploadModal />
      <UnloadDialog />
      <RewardsModals />

      {!NATIVE_MOBILE && client !== Client.ELECTRON && (
        <BrowserPushConfirmationModal />
      )}

      {!isMobileClient && (
        <>
          <EmbedModal />
          <EditPlaylistModal />
          <ConnectedUserListModal />
          <AppCTAModal />
          <TierExplainerModal />
        </>
      )}

      {isMobileClient && (
        <>
          <ConnectedMobileOverflowModal />
          <UnfollowConfirmationModal />
          <DeletePlaylistConfirmationModal />
        </>
      )}
    </>
  )
}

export default Modals
