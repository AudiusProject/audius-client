import {
  FormEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useCallback
} from 'react'

import {
  Name,
  User,
  encodeHashId,
  accountSelectors,
  statusIsNotFinalized,
  signOutActions,
  ErrorLevel,
  CommonState
} from '@audius/common'
import { CreateGrantRequest } from '@audius/sdk'
import {
  Button,
  ButtonProps,
  IconArrow,
  IconAtSign,
  IconValidationX,
  IconVisibilityPublic,
  IconPencil
} from '@audius/stems'
import base64url from 'base64url'
import cn from 'classnames'
import * as queryString from 'query-string'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'

import HorizontalLogo from 'assets/img/publicSite/Horizontal-Logo-Full-Color-Deprecated@2x.png'
import { make, useRecord } from 'common/store/analytics/actions'
import Input from 'components/data-entry/Input'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { ProfileInfo } from 'components/profile-info/ProfileInfo'
import { audiusBackendInstance } from 'services/audius-backend/audius-backend-instance'
import { audiusSdk } from 'services/audius-sdk'
import { reportToSentry } from 'store/errors/reportToSentry'
import { ERROR_PAGE, SIGN_UP_PAGE } from 'utils/route'

import styles from './OAuthLoginPage.module.css'
import {
  getFormattedAppAddress,
  getIsRedirectValid,
  isValidApiKey
} from './utils'
const { signOut } = signOutActions
const { getAccountUser, getAccountStatus } = accountSelectors

const messages = {
  alreadyLoggedInAuthorizePrompt: (appName: string) =>
    `Authorize ${appName} to use your Audius account?`,
  signInAndAuthorizePrompt: (appName: string) =>
    `Sign in to allow ${appName} to use your Audius account?`,
  alreadyAuthorizedContinuePrompt: (appName: string) => `Sign in to ${appName}`,
  permissionsRequestedHeader: 'This application will receive',
  readOnlyAccountAccess: 'Read-only access to your account',
  writeAccountAccess: 'Read/Write access to your account',
  emailAddressAccess: 'Your Email Address',
  doesNotGrantAccessTo: 'Does not grant access to:',
  walletsOrDMs: 'Wallets or Direct Messages',
  signOut: 'Not you? Sign Out & Switch Account',
  signUp: `Don't have an account? Sign up`,
  authorizeButton: 'Authorize App',
  continueButton: 'Continue',
  signInButton: 'Sign In & Authorize App',
  invalidCredentialsError: 'Invalid Credentials',
  miscError: 'An error has occurred. Please try again.',
  accountIncompleteError:
    'It looks like your account was never fully completed! Please complete your sign-up first.',
  redirectURIInvalidError:
    'Whoops, this is an invalid link (redirect URI missing or invalid).',
  missingAppNameError: 'Whoops, this is an invalid link (app name missing).',
  scopeError: `Whoops, this is an invalid link (scope missing or invalid).`,
  missingFieldError: 'Whoops, you must enter both your email and password.',
  originInvalidError:
    'Whoops, this is an invalid link (redirect URI is set to `postMessage` but origin is missing).',
  noWindowError:
    'Whoops, something went wrong. Please close this window and try again.',
  responseModeError:
    'Whoops, this is an invalid link (response mode invalid - if set, must be "fragment" or "query").',
  signedInAs: `You’re signed in as`,
  missingApiKeyError: 'Whoops, this is an invalid link (app API Key missing)',
  invalidApiKeyError: 'Whoops, this is an invalid link (app API Key invalid)'
}

const authWrite = async ({ userId, appApiKey }: CreateGrantRequest) => {
  const sdk = await audiusSdk()
  await sdk.grants.createGrant({
    userId,
    appApiKey
  })
}

const getDeveloperApp = async (address: string) => {
  const sdk = await audiusSdk()
  const developerApp = await sdk.developerApps.getDeveloperApp({ address })
  return developerApp.data
}

const getIsAppAuthorized = async ({
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

const CTAButton = ({
  isSubmitting,
  ...restProps
}: { isSubmitting: boolean } & ButtonProps) => {
  return (
    <Button
      isDisabled={isSubmitting}
      rightIcon={
        isSubmitting ? (
          <LoadingSpinner className={styles.buttonLoadingSpinner} />
        ) : (
          <IconArrow />
        )
      }
      className={styles.ctaButton}
      {...restProps}
    />
  )
}

const PermissionsSection = ({
  scope,
  isLoggedIn,
  userEmail
}: {
  scope: string | string[] | null
  isLoggedIn: boolean
  userEmail?: string | null
}) => {
  return (
    <>
      <div className={styles.permsTitleContainer}>
        <h3 className={styles.infoSectionTitle}>
          {messages.permissionsRequestedHeader}
        </h3>
      </div>
      <div className={styles.tile}>
        <div className={styles.permissionContainer}>
          <div
            className={cn({
              [styles.visibilityIconWrapper]: scope === 'read'
            })}
          >
            {scope === 'write' ? (
              <IconPencil
                className={cn(styles.permissionIcon)}
                width={18}
                height={18}
              />
            ) : (
              <IconVisibilityPublic
                className={cn(styles.permissionIcon, styles.visibilityIcon)}
                width={21}
                height={22}
              />
            )}
          </div>

          <div className={styles.permissionTextContainer}>
            <span className={styles.permissionText}>
              {scope === 'write'
                ? messages.writeAccountAccess
                : messages.readOnlyAccountAccess}
            </span>
            {scope === 'read' ? null : (
              <div className={cn(styles.permissionDetailTextContainer)}>
                <p
                  className={cn(
                    styles.permissionText,
                    styles.permissionDetailText
                  )}
                >
                  {messages.doesNotGrantAccessTo}
                  <br />
                  {messages.walletsOrDMs}
                </p>
              </div>
            )}
          </div>
        </div>
        <div
          className={cn(
            styles.permissionContainer,
            styles.nonFirstPermissionContainer
          )}
        >
          <div>
            <IconAtSign
              width={15}
              height={15}
              className={cn(styles.permissionIcon, styles.atSignIcon)}
            />
          </div>
          <div className={styles.permissionTextContainer}>
            <span className={styles.permissionText}>
              {messages.emailAddressAccess}
            </span>
            {isLoggedIn ? (
              <div className={cn(styles.permissionDetailTextContainer)}>
                <span
                  className={cn(
                    styles.permissionText,
                    styles.permissionDetailText,
                    {
                      [styles.permissionTextExtraLight]: !userEmail
                    }
                  )}
                >
                  {userEmail == null ? (
                    <>
                      <LoadingSpinner className={styles.loadingSpinner} /> Email
                      loading...
                    </>
                  ) : (
                    userEmail
                  )}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}

export const OAuthLoginPage = () => {
  useLayoutEffect(() => {
    document.body.classList.add(styles.bgWhite)
    return () => {
      document.body.classList.remove(styles.bgWhite)
    }
  }, [])
  const record = useRecord()

  const { search } = useLocation()
  const history = useHistory()
  const {
    scope,
    state,
    redirect_uri,
    app_name: queryParamAppName,
    response_mode,
    api_key,
    origin: originParam
  } = queryString.parse(search)

  const parsedRedirectUri = useMemo(() => {
    if (redirect_uri && typeof redirect_uri === 'string') {
      if (redirect_uri.toLowerCase() === 'postmessage') {
        return 'postmessage'
      }
      try {
        return new URL(decodeURIComponent(redirect_uri))
      } catch {
        return null
      }
    }
    return null
  }, [redirect_uri])

  const isRedirectValid = useMemo(() => {
    return getIsRedirectValid({ parsedRedirectUri, redirectUri: redirect_uri })
  }, [parsedRedirectUri, redirect_uri])

  const parsedOrigin = useMemo(() => {
    if (originParam && typeof originParam === 'string') {
      try {
        return new URL(originParam)
      } catch {
        return null
      }
    }
    return null
  }, [originParam])

  let initError: string | null = null
  if (isRedirectValid === false) {
    initError = messages.redirectURIInvalidError
  } else if (parsedRedirectUri === 'postmessage' && !parsedOrigin) {
    // Only applicable if redirect URI set to `postMessage`
    initError = messages.originInvalidError
  } else if (scope !== 'read' && scope !== 'write') {
    initError = messages.scopeError
  } else if (
    response_mode &&
    response_mode !== 'query' &&
    response_mode !== 'fragment'
  ) {
    initError = messages.responseModeError
  } else if (scope === 'read') {
    // Read scope-specific validations:
    if (!queryParamAppName && !api_key) {
      initError = messages.missingAppNameError
    }
  } else if (scope === 'write') {
    // Write scope-specific validations:
    if (!api_key) {
      initError = messages.missingApiKeyError
    } else if (!isValidApiKey(api_key)) {
      initError = messages.invalidApiKeyError
    }
  }

  const dispatch = useDispatch()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const accountIsLoading = useSelector((state: CommonState) => {
    const status = getAccountStatus(state)
    return statusIsNotFinalized(status)
  })
  const account = useSelector(getAccountUser)
  const isLoggedIn = Boolean(account)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  /** The fetched developer app name if write OAuth (we use `queryParamAppName` if read OAuth and no API key is given) */
  const [registeredDeveloperAppName, setRegisteredDeveloperAppName] =
    useState<string>()
  const appName = registeredDeveloperAppName ?? queryParamAppName

  const [userAlreadyWriteAuthorized, setUserAlreadyWriteAuthorized] =
    useState<boolean>()
  const [queryParamsError, setQueryParamsError] = useState<string | null>(
    initError
  )
  console.log('apikey', api_key)
  console.log('registered name', registeredDeveloperAppName)
  console.log('isLoggedIN', isLoggedIn)
  console.log('userAlready', userAlreadyWriteAuthorized)
  console.log('end')
  const loading =
    accountIsLoading ||
    (api_key &&
      (registeredDeveloperAppName === undefined ||
        userAlreadyWriteAuthorized === undefined))

  const [emailInput, setEmailInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [hasCredentialsError, setHasCredentialsError] = useState(false)
  const [generalSubmitError, setGeneralSubmitError] = useState<string | null>(
    null
  )

  const clearErrors = () => {
    setGeneralSubmitError(null)
    setHasCredentialsError(false)
  }

  const setAndLogGeneralSubmitError = useCallback(
    (isUserError: boolean, errorMessage: string, error?: Error) => {
      setGeneralSubmitError(errorMessage)
      record(
        make(Name.AUDIUS_OAUTH_ERROR, { isUserError, error: errorMessage })
      )
      if (error && !isUserError) {
        reportToSentry({ level: ErrorLevel.Error, error })
      }
    },
    [record]
  )

  const setAndLogInvalidCredentialsError = () => {
    setHasCredentialsError(true)
    record(
      make(Name.AUDIUS_OAUTH_ERROR, {
        isUserError: true,
        error: messages.invalidCredentialsError
      })
    )
  }

  useEffect(() => {
    if (!queryParamsError) {
      record(
        make(Name.AUDIUS_OAUTH_START, {
          redirectUriParam:
            parsedRedirectUri === 'postmessage' ? 'postmessage' : redirect_uri!,
          originParam,
          appNameParam: queryParamAppName!, // queryParamAppName must be non null since queryParamsError is falsey
          responseMode: response_mode
        })
      )
    }
  }, [
    queryParamAppName,
    originParam,
    parsedRedirectUri,
    queryParamsError,
    record,
    redirect_uri,
    response_mode
  ])

  useEffect(() => {
    const fetchDeveloperAppName = async () => {
      if (!api_key || queryParamsError) {
        return
      }
      let developerApp
      try {
        developerApp = await getDeveloperApp(api_key as string)
      } catch {
        setQueryParamsError(messages.invalidApiKeyError)
        return
      }
      if (!developerApp) {
        setQueryParamsError(messages.invalidApiKeyError)
        return
      }
      setRegisteredDeveloperAppName(developerApp.name)
    }
    fetchDeveloperAppName()
  }, [api_key, queryParamAppName, queryParamsError, scope])

  const formOAuthResponse = useCallback(
    async (account: User) => {
      let email: string
      if (!userEmail) {
        try {
          email = await audiusBackendInstance.getUserEmail()
        } catch {
          history.push(ERROR_PAGE)
          return
        }
      } else {
        email = userEmail
      }

      const gateways = audiusBackendInstance.getCreatorNodeIPFSGateways(
        account.creator_node_endpoint
      )
      const cNode = gateways[0]
      let profilePicture:
        | { '150x150': string; '480x480': string; '1000x1000': string }
        | undefined
      if (account.profile_picture_sizes) {
        const base = `${cNode}${account.profile_picture_sizes}/`
        profilePicture = {
          '150x150': `${base}150x150.jpg`,
          '480x480': `${base}480x480.jpg`,
          '1000x1000': `${base}1000x1000.jpg`
        }
      } else if (account.profile_picture) {
        const url = `${cNode}${account.profile_picture}`
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
        signedData = await audiusBackendInstance.signDiscoveryNodeRequest(
          message
        )
      } catch {
        return
      }
      const signature = signedData.signature
      return `${header}.${payload}.${base64url.encode(signature)}`
    },
    [history, userEmail]
  )

  const formResponseAndRedirect = useCallback(
    async (account: User) => {
      const jwt = await formOAuthResponse(account)
      if (jwt == null) {
        setIsSubmitting(false)
        setAndLogGeneralSubmitError(false, messages.miscError)
        return
      }
      if (isRedirectValid === true) {
        if (parsedRedirectUri === 'postmessage') {
          if (parsedOrigin) {
            if (!window.opener) {
              setAndLogGeneralSubmitError(false, messages.noWindowError)
              setIsSubmitting(false)
            } else {
              record(make(Name.AUDIUS_OAUTH_COMPLETE, {}))
              window.opener.postMessage(
                { state, token: jwt },
                parsedOrigin.origin
              )
            }
          }
        } else {
          record(make(Name.AUDIUS_OAUTH_COMPLETE, {}))
          if (response_mode && response_mode === 'query') {
            if (state != null) {
              parsedRedirectUri!.searchParams.append('state', state as string)
            }
            parsedRedirectUri!.searchParams.append('token', jwt)
          } else {
            const statePart = state != null ? `state=${state}&` : ''
            parsedRedirectUri!.hash = `#${statePart}token=${jwt}`
          }
          window.location.href = parsedRedirectUri!.toString()
        }
      }
    },
    [
      formOAuthResponse,
      isRedirectValid,
      parsedOrigin,
      parsedRedirectUri,
      record,
      response_mode,
      setAndLogGeneralSubmitError,
      state
    ]
  )

  useEffect(() => {
    const getInitialAuthorizationStatus = async () => {
      if (queryParamsError || !api_key || !isLoggedIn) {
        setUserAlreadyWriteAuthorized(false)
        return
      }
      let appAlreadyAuthorized
      try {
        appAlreadyAuthorized = await getIsAppAuthorized({
          userId: encodeHashId(account!.user_id), // We know account exists because isLoggedIn is true
          apiKey: api_key as string
        })
      } catch (e) {
        if (e instanceof Error) {
          reportToSentry({ level: ErrorLevel.Error, error: e })
        }
        history.push(ERROR_PAGE)
        return
      }
      setUserAlreadyWriteAuthorized(appAlreadyAuthorized)
    }
    getInitialAuthorizationStatus()
  }, [
    account,
    api_key,
    formResponseAndRedirect,
    history,
    isLoggedIn,
    queryParamsError,
    scope
  ])

  useEffect(() => {
    const getAndSetEmail = async () => {
      let email: string
      try {
        email = await audiusBackendInstance.getUserEmail()
      } catch {
        setUserEmail(null)
        history.push(ERROR_PAGE)
        return
      }
      setUserEmail(email)
    }
    if (isLoggedIn) {
      getAndSetEmail()
    } else {
      setUserEmail(null)
    }
  }, [history, isLoggedIn])

  const authorize = async (account: User) => {
    if (scope === 'write') {
      let shouldCreateWriteGrant
      try {
        shouldCreateWriteGrant = await getIsAppAuthorized({
          userId: encodeHashId(account.user_id),
          apiKey: api_key as string
        })
        if (!shouldCreateWriteGrant) {
          await authWrite({
            userId: encodeHashId(account.user_id),
            appApiKey: api_key as string
          })
        }
      } catch (e: unknown) {
        setIsSubmitting(false)
        let errorMessage = 'Creating write grant failed'
        if (typeof e === 'string') {
          errorMessage = e.toUpperCase()
        } else if (e instanceof Error) {
          errorMessage = e.message
        }
        setAndLogGeneralSubmitError(
          false,
          errorMessage,
          e instanceof Error ? e : undefined
        )
        return
      }
    }
    await formResponseAndRedirect(account)
  }

  const handleSignInFormSubmit = async (e: FormEvent) => {
    e.preventDefault()
    record(make(Name.AUDIUS_OAUTH_SUBMIT, { alreadySignedIn: false }))
    clearErrors()
    if (!emailInput || !passwordInput) {
      setAndLogGeneralSubmitError(true, messages.missingFieldError)
      return
    }
    setIsSubmitting(true)
    let signInResponse: any
    try {
      signInResponse = await audiusBackendInstance.signIn(
        emailInput,
        passwordInput
      )
    } catch (err) {
      setIsSubmitting(false)
      setAndLogGeneralSubmitError(
        false,
        messages.miscError,
        err instanceof Error ? err : undefined
      )
      return
    }
    if (
      !signInResponse.error &&
      signInResponse.user &&
      signInResponse.user.name
    ) {
      // Success - perform Oauth authorization
      await authorize(signInResponse.user)
    } else if (
      (!signInResponse.error &&
        signInResponse.user &&
        !signInResponse.user.name) ||
      (signInResponse.error && signInResponse.phase === 'FIND_USER')
    ) {
      setIsSubmitting(false)
      setAndLogGeneralSubmitError(false, messages.accountIncompleteError)
    } else {
      setIsSubmitting(false)
      setAndLogInvalidCredentialsError()
    }
  }

  const handleAlreadySignedInAuthorizeSubmit = () => {
    clearErrors()
    record(make(Name.AUDIUS_OAUTH_SUBMIT, { alreadySignedIn: true }))
    if (!account) {
      setAndLogGeneralSubmitError(false, messages.miscError)
    } else {
      setIsSubmitting(true)
      authorize(account)
    }
  }

  const handleSignOut = () => {
    dispatch(signOut())
  }

  let titleText
  if (!isLoggedIn) {
    titleText = messages.signInAndAuthorizePrompt(appName as string)
  } else if (userAlreadyWriteAuthorized) {
    titleText = messages.alreadyAuthorizedContinuePrompt(appName as string)
  } else {
    titleText = messages.alreadyLoggedInAuthorizePrompt(appName as string)
  }

  if (queryParamsError) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.centeredContent}>
            <img
              src={HorizontalLogo}
              className={styles.logo}
              alt='Audius Logo'
            />
          </div>
          <div className={cn(styles.centeredContent, styles.titleContainer)}>
            <span className={styles.errorText}>{queryParamsError}</span>
          </div>
        </div>
      </div>
    )
  }
  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.centeredContent}>
            <div className={styles.logoContainer}>
              <img
                src={HorizontalLogo}
                className={styles.logo}
                alt='Audius Logo'
              />
            </div>
          </div>
          <div
            className={cn(styles.centeredContent, styles.loadingStateContainer)}
          >
            <LoadingSpinner className={styles.loadingStateSpinner} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.centeredContent}>
          <div className={styles.logoContainer}>
            <img
              src={HorizontalLogo}
              className={styles.logo}
              alt='Audius Logo'
            />
          </div>
        </div>
        <div className={cn(styles.centeredContent, styles.titleContainer)}>
          <h1 className={styles.title}>{titleText}</h1>
        </div>
        {userAlreadyWriteAuthorized ? null : (
          <PermissionsSection
            scope={scope}
            userEmail={userEmail}
            isLoggedIn={isLoggedIn}
          />
        )}
        {isLoggedIn ? (
          <div className={styles.userInfoContainer}>
            <h3 className={styles.infoSectionTitle}>{messages.signedInAs}</h3>
            <div className={styles.tile}>
              <ProfileInfo
                displayNameClassName={styles.userInfoDisplayName}
                handleClassName={styles.userInfoHandle}
                centered={false}
                imgClassName={styles.profileImg}
                className={styles.userInfo}
                user={account}
              />
            </div>
            <div className={styles.signOutButtonContainer}>
              <button className={styles.linkButton} onClick={handleSignOut}>
                {messages.signOut}
              </button>
            </div>
            <CTAButton
              isSubmitting={isSubmitting}
              text={
                userAlreadyWriteAuthorized
                  ? messages.continueButton
                  : messages.authorizeButton
              }
              onClick={handleAlreadySignedInAuthorizeSubmit}
            />
          </div>
        ) : (
          <div className={styles.signInFormContainer}>
            <form onSubmit={handleSignInFormSubmit}>
              <Input
                placeholder='Email'
                size='medium'
                type='email'
                name='email'
                id='email-input'
                required
                autoComplete='username'
                value={emailInput}
                onChange={setEmailInput}
              />
              <Input
                className={styles.passwordInput}
                placeholder='Password'
                size='medium'
                name='password'
                id='password-input'
                required
                autoComplete='current-password'
                value={passwordInput}
                type='password'
                onChange={setPasswordInput}
              />
              {!hasCredentialsError ? null : (
                <div className={styles.credentialsErrorContainer}>
                  <IconValidationX
                    width={14}
                    height={14}
                    className={styles.credentialsErrorIcon}
                  />
                  <span className={styles.errorText}>
                    {messages.invalidCredentialsError}
                  </span>
                </div>
              )}
              <CTAButton
                isSubmitting={isSubmitting}
                text={messages.signInButton}
                buttonType='submit'
              />
            </form>
            <div className={styles.signUpButtonContainer}>
              <a
                className={styles.linkButton}
                href={SIGN_UP_PAGE}
                target='_blank'
                rel='noopener noreferrer'
              >
                {messages.signUp}
              </a>
            </div>
          </div>
        )}
        {generalSubmitError == null ? null : (
          <div className={styles.generalErrorContainer}>
            <span className={styles.errorText}>{generalSubmitError}</span>
          </div>
        )}
      </div>
    </div>
  )
}
