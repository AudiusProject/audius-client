import { encodeHashId, User, SquareSizes } from '@audius/common'
import { CreateGrantRequest } from '@audius/sdk'
import base64url from 'base64url'

import { audiusBackendInstance } from 'services/audius-backend/audius-backend-instance'
import { audiusSdk } from 'services/audius-sdk'
import { getStorageNodeSelector } from 'services/audius-sdk/storageNodeSelector'

export const getIsRedirectValid = ({
  parsedRedirectUri,
  redirectUri
}: {
  parsedRedirectUri: 'postmessage' | URL | null
  redirectUri: string | string[] | null
}) => {
  if (redirectUri) {
    if (parsedRedirectUri == null) {
      // This means the redirect uri is not a string (and is thus invalid) or the URI format was invalid
      return false
    }
    if (parsedRedirectUri === 'postmessage') {
      return true
    }
    const { hash, username, password, pathname, hostname } = parsedRedirectUri
    if (hash || username || password) {
      return false
    }
    if (
      pathname.includes('/..') ||
      pathname.includes('\\..') ||
      pathname.includes('../')
    ) {
      return false
    }

    // From https://stackoverflow.com/questions/106179/regular-expression-to-match-dns-hostname-or-ip-address:
    const ipRegex =
      /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
    const localhostIPv4Regex =
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    // Disallow IP addresses as redirect URIs unless it's localhost
    if (
      ipRegex.test(hostname) &&
      hostname !== '[::1]' &&
      !localhostIPv4Regex.test(hostname)
    ) {
      return false
    }
    // TODO(nkang): Potentially check URI against malware list like https://urlhaus-api.abuse.ch/#urlinfo
    return true
  } else {
    return false
  }
}

export const isValidApiKey = (key: string | string[]) => {
  if (Array.isArray(key)) return false
  if (key.length !== 40) {
    return false
  }
  const hexadecimalRegex = /^[0-9a-fA-F]+$/
  return hexadecimalRegex.test(key)
}

export const getFormattedAppAddress = ({
  apiKey,
  includePrefix
}: {
  apiKey: string
  includePrefix: boolean
}) => {
  let result
  if (!apiKey.startsWith('0x')) {
    if (includePrefix) {
      result = `0x${apiKey}`
    } else {
      result = apiKey
    }
  } else {
    if (includePrefix) {
      result = apiKey
    } else {
      result = apiKey.slice(2)
    }
  }
  return result.toLowerCase()
}

export const formOAuthResponse = async ({
  account,
  userEmail,
  onError
}: {
  account: User
  userEmail?: string | null
  onError: () => void
}) => {
  let email: string
  if (!userEmail) {
    try {
      email = await audiusBackendInstance.getUserEmail()
    } catch {
      onError()
      return
    }
  } else {
    email = userEmail
  }

  const storageNodeSelector = await getStorageNodeSelector()
  let profilePicture:
    | { '150x150': string; '480x480': string; '1000x1000': string }
    | undefined
  if (account.profile_picture_sizes) {
    const storageNode = storageNodeSelector.getNodes(
      account.profile_picture_sizes
    )[0]
    const base = `${storageNode}/content/`
    profilePicture = {
      '150x150': `${base}${account.profile_picture_sizes}/150x150.jpg`,
      '480x480': `${base}${account.profile_picture_sizes}/480x480.jpg`,
      '1000x1000': `${base}${account.profile_picture_sizes}/1000x1000.jpg`
    }
    if (account.profile_picture_cids) {
      if (account.profile_picture_cids[SquareSizes.SIZE_150_BY_150]) {
        profilePicture['150x150'] = `${base}${
          account.profile_picture_cids[SquareSizes.SIZE_150_BY_150]
        }`
      }
      if (account.profile_picture_cids[SquareSizes.SIZE_480_BY_480]) {
        profilePicture['480x480'] = `${base}${
          account.profile_picture_cids[SquareSizes.SIZE_480_BY_480]
        }`
      }
      if (account.profile_picture_cids[SquareSizes.SIZE_1000_BY_1000]) {
        profilePicture['1000x1000'] = `${base}${
          account.profile_picture_cids[SquareSizes.SIZE_1000_BY_1000]
        }`
      }
    }
  } else if (account.profile_picture) {
    const storageNode = storageNodeSelector.getNodes(account.profile_picture)[0]
    const url = `${storageNode}/content/${account.profile_picture}`
    profilePicture = {
      '150x150': url,
      '480x480': url,
      '1000x1000': url
    }
  }
  const timestamp = Math.round(new Date().getTime() / 1000)
  const userId = encodeHashId(account?.user_id)
  const response = {
    userId,
    email,
    name: account?.name,
    handle: account?.handle,
    verified: account?.is_verified,
    profilePicture,
    sub: userId,
    iat: timestamp
  }
  const header = base64url.encode(
    JSON.stringify({ typ: 'JWT', alg: 'keccak256' })
  )
  const payload = base64url.encode(JSON.stringify(response))

  const message = `${header}.${payload}`
  let signedData: { data: string; signature: string }
  try {
    signedData = await audiusBackendInstance.signDiscoveryNodeRequest(message)
  } catch {
    onError()
    return
  }
  const signature = signedData.signature
  return `${header}.${payload}.${base64url.encode(signature)}`
}

export const authWrite = async ({ userId, appApiKey }: CreateGrantRequest) => {
  const sdk = await audiusSdk()
  await sdk.grants.createGrant({
    userId,
    appApiKey
  })
}

export const getDeveloperApp = async (address: string) => {
  const sdk = await audiusSdk()
  const developerApp = await sdk.developerApps.getDeveloperApp({ address })
  return developerApp.data
}

export const getIsAppAuthorized = async ({
  userId,
  apiKey
}: {
  userId: string
  apiKey: string
}) => {
  const sdk = await audiusSdk()
  const authorizedApps = await sdk.users.getAuthorizedApps({ id: userId })
  const prefixedAppAddress = getFormattedAppAddress({
    apiKey,
    includePrefix: true
  })
  const foundIndex = authorizedApps.data?.findIndex(
    (a) => a.address.toLowerCase() === prefixedAppAddress
  )
  return foundIndex !== undefined && foundIndex > -1
}
