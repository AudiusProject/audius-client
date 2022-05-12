import React, { FormEvent, useEffect, useRef, useState } from 'react'

import { Button } from '@audius/stems'
import base64url from 'base64url'
import * as queryString from 'query-string'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'

import { getAccountUser } from 'common/store/account/selectors'
import Input from 'components/data-entry/Input'
import AudiusBackend from 'services/AudiusBackend'

import styles from '../styles/OAuthLoginPage.module.css'

export const OAuthLoginPage = () => {
  const { search, hash } = useLocation()
  const isRedirectValidRef = useRef<undefined | boolean>(undefined)
  const { scope, state, redirect_uri } = queryString.parse(search)
  const { token } = queryString.parse(hash)
  const account = useSelector(getAccountUser)
  const isLoggedIn = Boolean(account)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (redirect_uri) {
      if (typeof redirect_uri !== 'string') {
        return
      }
      let parsedURL: URL
      try {
        parsedURL = new URL(redirect_uri)
      } catch {
        return
      }
      const { hash, username, password, pathname } = parsedURL
      if (hash || username || password) {
        return
      }
      if (
        pathname.includes('/..') ||
        pathname.includes('\\..') ||
        pathname.includes('../')
      ) {
        return
      }
    }
    isRedirectValidRef.current = true
  }, [redirect_uri])

  const formOAuthResponse = async () => {
    let email: string | undefined | null
    try {
      email = await AudiusBackend.getUserEmail()
    } catch {
      setSubmitError('Something went wrong.')
      return
    }
    const timestamp = Math.round(new Date().getTime() / 1000)
    const response = { email, state, iat: timestamp }
    const header = base64url.encode(
      JSON.stringify({ typ: 'JWT', alg: 'keccak256' })
    )
    const payload = base64url.encode(JSON.stringify(response))

    const message = `${header}.${payload}`
    let signedData: { data: string; signature: string }
    try {
      signedData = await AudiusBackend.signDiscoveryNodeRequest(message)
    } catch {
      setSubmitError('Something went wrong.')
      return
    }
    const signature = signedData.signature

    return `${header}.${payload}.${base64url.encode(signature)}`
  }

  const onFormSubmit = async (e: FormEvent) => {
    e.preventDefault()
    let signInResponse: any
    try {
      signInResponse = await AudiusBackend.signIn(email, password)
    } catch (err) {
      setSubmitError('Unknown error')
    }

    if (
      !signInResponse.error &&
      signInResponse.user &&
      signInResponse.user.name
    ) {
      // Success - perform Oauth authorization
    } else if (
      (!signInResponse.error &&
        signInResponse.user &&
        !signInResponse.user.name) ||
      (signInResponse.error && signInResponse.phase === 'FIND_USER')
    ) {
      setSubmitError('Sign up incomplete')
    } else {
      setSubmitError('Wrong credentials')
    }
  }

  const authAndRedirect = async () => {
    const jwt = await formOAuthResponse()
    const statePart = state != null ? `state=${state}&` : ''
    const fragment = `#${statePart}token=${jwt}`
    if (isRedirectValidRef.current === true) {
      if (redirect_uri) {
        window.location.href = `${redirect_uri}${fragment}`
      } else {
        window.location.hash = `${statePart}token=${jwt}`
      }
    }
  }

  if (token) {
    return (
      <div className={styles.container}>You should be redirected soon...</div>
    )
  }

  if (isRedirectValidRef.current === false) {
    return (
      <div className={styles.container}>
        Something went wrong - this is an invalid link.
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        <ul>
          <li>Scope: {scope}</li>
          <li>State: {state}</li>
          <li>Redirect URL: {redirect_uri}</li>
          <li>Submission error: {submitError}</li>
        </ul>
      </div>
      <div>
        {isLoggedIn ? (
          // TODO(nkang): Allow user to use different account
          <Button text='Continue' onClick={authAndRedirect} />
        ) : (
          <form onSubmit={onFormSubmit}>
            <Input
              placeholder='Email'
              size='medium'
              type='email'
              name='email'
              id='email-input'
              autoComplete='username'
              value={email}
              onChange={setEmail}
            />
            <Input
              placeholder='Password'
              size='medium'
              name='password'
              id='password-input'
              autoComplete='current-password'
              value={password}
              type='password'
              onChange={setPassword}
            />
            <Button text='Submit' buttonType='submit' />
          </form>
        )}
      </div>
    </div>
  )
}
