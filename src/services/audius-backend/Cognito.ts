import AudiusBackend, {
  AuthHeaders,
  IDENTITY_SERVICE
} from 'services/AudiusBackend'
import { waitForLibsInit } from 'services/audius-backend/eagerLoadUtils'

// @ts-ignore
const libs = () => window.audiusLibs

type ResponseError = {
  statusCode?: number
  object?: { message: string }
}

type CognitoSignatureResponse = { signature: string }
export const getCognitoSignature = async () => {
  await waitForLibsInit()
  const account = libs().Account.getCurrentUser()
  if (!account) return {}
  try {
    const { data, signature } = await AudiusBackend.signData()
    const response = await fetch(`${IDENTITY_SERVICE}/cognito_signature`, {
      headers: {
        'Content-Type': 'application/json',
        [AuthHeaders.Message]: data,
        [AuthHeaders.Signature]: signature
      }
    })
    const json = (await response.json()) as
      | CognitoSignatureResponse
      | ResponseError
    return json
  } catch (e) {
    console.error(e)
    return {}
  }
}

type CognitoFlowResponse = { shareable_url: string }
export const getCognitoFlow = async (templateId: string) => {
  await waitForLibsInit()
  const account = libs().Account.getCurrentuser()
  if (!account) return {}
  try {
    const { data, signature } = await AudiusBackend.signData()
    const response = await fetch(`${IDENTITY_SERVICE}/cognito_flow`, {
      headers: {
        'Content-Type': 'application/json',
        [AuthHeaders.Message]: data,
        [AuthHeaders.Signature]: signature
      },
      body: JSON.stringify({ template_id: templateId })
    })

    const json = (await response.json()) as CognitoFlowResponse | ResponseError
    return json
  } catch (e) {
    console.error(e)
    return {}
  }
}
