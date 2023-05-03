import { useState } from 'react'

import type { AudiusSdk } from '@audius/sdk'
import { ChatPermission } from '@audius/sdk'

import { Status } from 'models/Status'

type useSetInboxPermissionsProps = {
  audiusSdk: () => Promise<AudiusSdk>
  initialPermission?: ChatPermission
  handleClose?: () => void
}

export const useSetInboxPermissions = ({
  audiusSdk,
  initialPermission = ChatPermission.ALL,
  handleClose
}: useSetInboxPermissionsProps) => {
  const [permissionStatus, setPermissionStatus] = useState<Status>(Status.IDLE)
  const [showSpinner, setShowSpinner] = useState(false)
  const [currentPermission, setCurrentPermission] =
    useState<ChatPermission>(initialPermission)

  const doSetPermissions = async () => {
    try {
      const sdk = await audiusSdk()
      await sdk.chats.permit({ permit: currentPermission })
      setPermissionStatus(Status.SUCCESS)
      handleClose?.()
    } catch (e) {
      console.error('Error saving chat permissions:', e)
      setPermissionStatus(Status.ERROR)
    }
  }

  if (permissionStatus !== Status.LOADING) {
    setPermissionStatus(Status.LOADING)
    setShowSpinner(false)
    // Only show the spinner if saving takes a while
    setTimeout(() => setShowSpinner(true), 1000)
    doSetPermissions()
  }

  return {
    currentPermission,
    setCurrentPermission,
    permissionStatus,
    showSpinner
  }
}
