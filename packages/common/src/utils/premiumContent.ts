import { AudiusBackend } from 'services/audius-backend';


export async function generateUserSignature(
  audiusBackendInstance: AudiusBackend
) {
  const data = `Premium content user signature at ${Date.now()}`
  const signature = await audiusBackendInstance.getSignature(data)
  return { data, signature }
}
