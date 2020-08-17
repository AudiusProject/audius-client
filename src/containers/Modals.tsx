import React from 'react'

import ServiceSelectionModal from 'containers/service-selection/ServiceSelectionModal'
import EditTrackModal from 'containers/edit-track/EditTrackModal'
import PasswordResetModal from 'containers/password-reset/PasswordResetModal'
import ConnectedMobileOverflowModal from 'containers/track-overflow-modal/ConnectedMobileOverflowModal'
import UnfollowConfirmationModal from 'containers/unfollow-confirmation-modal/UnfollowConfirmationModal'
import DeletePlaylistConfirmationModal from 'containers/delete-playlist-confirmation-modal/DeletePlaylistConfirmationModal'
import EmbedModal from './embed-modal/EmbedModal'
import ConnectedUserListModal from 'containers/user-list-modal/ConnectedUserListModal'
import BrowserPushConfirmationModal from './browser-push-confirmation-modal/BrowserPushConfirmationModal'
import FirstUploadModal from 'containers/first-upload-modal/FirstUploadModal'
import UnloadDialog from 'containers/unload-dialog/UnloadDialog'

import { getClient } from 'utils/clientUtil'
import Client from 'models/Client'
import AppCTAModal from './app-cta-modal/AppCTAModal'

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

      {!isMobileClient && <EmbedModal />}
      {!isMobileClient && <ConnectedUserListModal />}
      {!NATIVE_MOBILE && client !== Client.ELECTRON && (
        <BrowserPushConfirmationModal />
      )}
      {!isMobileClient && <AppCTAModal />}

      {isMobileClient && <ConnectedMobileOverflowModal />}
      {isMobileClient && <UnfollowConfirmationModal />}
      {isMobileClient && <DeletePlaylistConfirmationModal />}
    </>
  )
}

export default Modals
