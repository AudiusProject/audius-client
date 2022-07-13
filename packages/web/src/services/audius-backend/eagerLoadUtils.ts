/**
 * Utilities to assist in eager pre-fetching content from the
 * protocol before libs has initialized.
 */
import {
  getAudiusAccountUser,
  getCachedDiscoveryProvider
} from 'services/LocalStorage'

export const LIBS_INITTED_EVENT = 'LIBS_INITTED_EVENT'

const user = getAudiusAccountUser()
const cachedDiscprov = getCachedDiscoveryProvider()

const EAGER_DISCOVERY_NODES = process.env.REACT_APP_EAGER_DISCOVERY_NODES
  ? process.env.REACT_APP_EAGER_DISCOVERY_NODES.split(',')
  : []

// Set the eager discprov to use to either
// 1. local storage discprov if available
// 2. dapp whitelist
// Note: This discovery provider is only used on intial paint
let eagerDiscprov: string
if (cachedDiscprov) {
  eagerDiscprov = cachedDiscprov.endpoint
} else {
  eagerDiscprov =
    EAGER_DISCOVERY_NODES[
      Math.floor(Math.random() * EAGER_DISCOVERY_NODES.length)
    ]
}

export const getEagerDiscprov = () => eagerDiscprov

/**
 * Wait for the `LIBS_INITTED_EVENT` or pass through if there
 * already exists a mounted `window.audiusLibs` object.
 */
export const waitForLibsInit = async () => {
  // If libs is already defined, it has already loaded & initted
  // so do nothing
  // @ts-ignore
  if (window.audiusLibs) return
  // Add an event listener and resolve when that returns
  return new Promise((resolve) => {
    // @ts-ignore
    if (window.audiusLibs) resolve()
    window.addEventListener(LIBS_INITTED_EVENT, resolve)
  })
}

/**
 * Wraps a normal libs method call with method that calls the
 * provided eager variant if libs is not already loaded.
 * In the case the eager version returns an error, we wait for
 * libs to inititalize and then call the normal method.
 */
export const withEagerOption = async (
  {
    normal,
    eager,
    endpoint = eagerDiscprov,
    requiresUser = false
  }: {
    normal: (libs: any) => any
    eager: (...args: any) => any
    endpoint?: string
    requiresUser?: boolean
  },
  ...args: any
) => {
  // @ts-ignore
  if (window.audiusLibs) {
    // @ts-ignore
    return normal(window.audiusLibs)(...args)
  } else {
    try {
      const req = eager(...args)
      const res = await makeRequest(req, endpoint, requiresUser)
      return res
    } catch (e) {
      await waitForLibsInit()
      // @ts-ignore
      return normal(window.audiusLibs)(...args)
    }
  }
}

/**
 * Convertsa a provided URL params object to a query string
 */
const parmsToQS = (
  params: { [key: string]: string | string[] },
  formatWithoutArray = false
) => {
  if (!params) return ''
  return Object.keys(params)
    .map((k) => {
      if (Array.isArray(params[k])) {
        return (params[k] as string[])
          .map((val: string) =>
            formatWithoutArray
              ? `${encodeURIComponent(k)}=${encodeURIComponent(val)}`
              : `${encodeURIComponent(k)}[]=${encodeURIComponent(val)}`
          )
          .join('&')
      }
      return (
        encodeURIComponent(k) + '=' + encodeURIComponent(params[k] as string)
      )
    })
    .join('&')
}

/**
 * Takes a request object provided from the audius libs API and makes the request
 * using the fetch API.
 */
const makeRequest = async (
  req: any,
  endpoint: string = eagerDiscprov,
  requiresUser = false
) => {
  if (!user && requiresUser) throw new Error('User required to continue')

  const headers: { [key: string]: string } = {}
  if (user && user.user_id) {
    headers['X-User-ID'] = user.user_id
  }

  let baseUrl = `${endpoint}/${req.endpoint}`
  if (req.urlParams) {
    baseUrl = `${baseUrl}${req.urlParams}`
  }

  let res: any
  if (req?.method?.toLowerCase() === 'post') {
    headers['Content-Type'] = 'application/json'
    const url = `${baseUrl}?${parmsToQS(
      req.queryParams,
      endpoint === eagerDiscprov
    )}`
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.data)
    })
  } else {
    const url = `${baseUrl}?${parmsToQS(
      req.queryParams,
      endpoint === eagerDiscprov
    )}`
    res = await fetch(url, {
      headers
    })
  }

  const json = await res.json()
  if (json.data) return json.data
  return json
}
