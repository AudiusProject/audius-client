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
