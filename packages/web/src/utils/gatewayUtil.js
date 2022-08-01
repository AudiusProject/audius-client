import { audiusBackendInstance } from 'services/audius-backend/audius-backend-instance'

export const getCreatorNodeIPFSGateways = (endpoint) => {
  if (endpoint) {
    return endpoint
      .split(',')
      .filter(Boolean)
      .map((endpoint) => `${endpoint}/ipfs/`)
  }
  const gateways = [`${audiusBackendInstance.userNodeUrl}/ipfs/`]
  if (audiusBackendInstance.legacyUserNodeUrl) {
    gateways.push(`${audiusBackendInstance.legacyUserNodeUrl}/ipfs/`)
  }
  return gateways
}
