import { AudiusBackend, AuthHeaders } from 'common/services/audius-backend'
import { getErrorMessage } from 'common/utils/error'

export const recordIP = async (
  audiusBackendInstance: AudiusBackend
): Promise<{ userIP: string } | { error: boolean }> => {
  const audiusLibs = await audiusBackendInstance.getAudiusLibs()
  const account = audiusLibs.Account.getCurrentUser()
  if (!account) return { error: true }

  try {
    const { data, signature } = await audiusBackendInstance.signData()
    const response = await fetch(
      `${audiusBackendInstance.identityServiceUrl}/record_ip`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [AuthHeaders.Message]: data,
          [AuthHeaders.Signature]: signature
        }
      }
    )

    if (response.status >= 400 && response.status < 600) {
      throw new Error(
        `Request to record user IP failed: ${response.statusText}`
      )
    }
    return response.json()
  } catch (err) {
    console.error(getErrorMessage(err))
    return { error: true }
  }
}
