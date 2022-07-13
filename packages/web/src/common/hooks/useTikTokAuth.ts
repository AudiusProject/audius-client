import moment from 'moment'

type CreateUseTikTokAuthHookArguments = {
  authenticate: () => Promise<Credentials>
  handleError: (e: Error) => void
  getLocalStorageItem: (key: string) => Promise<string | null>
  setLocalStorageItem: (key: string, value: string) => Promise<void>
}

export type UseTikTokAuthArguments = {
  onError: (e: Error) => void
}

type WithAuthCallback = (accessToken: string, openId: string) => void

export type Credentials = {
  accessToken: string
  openId: string
  expiresIn: string
}

/**
 * A hook that returns a withAuth function that can be passed a function which will
 * be provided with the TikTok credentials on existing or successful auth
 */
export const createUseTikTokAuthHook =
  ({
    authenticate,
    handleError,
    getLocalStorageItem,
    setLocalStorageItem
  }: CreateUseTikTokAuthHookArguments) =>
  ({
    onError: errorCallback
  }: UseTikTokAuthArguments): ((callback: WithAuthCallback) => void) => {
    const onError = (e: Error) => {
      // First handle the error as specified by the arguments to createUseTikTokAuthHook
      handleError(e)
      // Secondly invoke the callback passed to the useTikTokAuth hook itself
      errorCallback(e)
    }

    const withAuth = async (callback: WithAuthCallback) => {
      const accessToken = await getLocalStorageItem('tikTokAccessToken')
      const openId = await getLocalStorageItem('tikTokOpenId')
      const expiration = await getLocalStorageItem(
        'tikTokAccessTokenExpiration'
      )

      const isExpired = expiration && moment().isAfter(expiration)
      if (accessToken && openId && !isExpired) {
        callback(accessToken, openId)
      } else {
        try {
          const credentials = await authenticate()
          await storeAccessToken(credentials)
          callback(credentials.accessToken, credentials.openId)
        } catch (e) {
          onError(e as Error)
        }
      }
    }

    const storeAccessToken = async ({
      accessToken,
      openId,
      expiresIn
    }: Credentials) => {
      await setLocalStorageItem('tikTokAccessToken', accessToken)
      await setLocalStorageItem('tikTokOpenId', openId)

      const expirationDate = moment().add(expiresIn, 's').format()
      await setLocalStorageItem('tikTokAccessTokenExpiration', expirationDate)
    }

    return withAuth
  }
