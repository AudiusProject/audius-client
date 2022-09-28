/**
 * Utilities to assist in eager pre-fetching content from the
 * protocol before libs has initialized.
 */

import { getEagerDiscprov } from '@audius/common'

import { env } from './env'
import { audiusLibs, waitForLibsInit } from './libs'
import { localStorage } from './local-storage'

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
    endpoint,
    requiresUser = false
  }: {
    normal: (libs: any) => any
    eager: (...args: any) => any
    endpoint?: string
    requiresUser?: boolean
  },
  ...args: any
) => {
  const disprovEndpoint =
    endpoint ?? (await getEagerDiscprov(localStorage, env))
  if (audiusLibs) {
    return normal(audiusLibs)(...args)
  } else {
    try {
      const req = eager(...args)
      const res = await makeRequest(
        req,
        disprovEndpoint as string,
        requiresUser
      )
      return res
    } catch (e) {
      await waitForLibsInit()
      return normal(audiusLibs)(...args)
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
  endpoint: string,
  requiresUser = false
) => {
  const eagerDiscprov = await getEagerDiscprov(localStorage, env)
  const discprovEndpoint = endpoint ?? eagerDiscprov
  const user = await localStorage.getAudiusAccountUser()
  if (!user && requiresUser) throw new Error('User required to continue')

  const headers: { [key: string]: string } = {}
  if (user && user.user_id) {
    headers['X-User-ID'] = user.user_id
  }

  let baseUrl = `${discprovEndpoint}/${req.endpoint}`
  if (req.urlParams) {
    baseUrl = `${baseUrl}${req.urlParams}`
  }

  let res: any
  if (req?.method?.toLowerCase() === 'post') {
    headers['Content-Type'] = 'application/json'
    const url = `${baseUrl}?${parmsToQS(
      req.queryParams,
      discprovEndpoint === eagerDiscprov
    )}`
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.data)
    })
  } else {
    const url = `${baseUrl}?${parmsToQS(
      req.queryParams,
      discprovEndpoint === eagerDiscprov
    )}`
    res = await fetch(url, {
      headers
    })
  }

  const json = await res.json()
  if (json.data) return json.data
  return json
}
