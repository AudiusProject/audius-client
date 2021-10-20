import React, { FormEvent, useEffect, useState } from 'react'

import { Button, ButtonType, IconArrow } from '@audius/stems'
import { useDispatch, useStore } from 'react-redux'
import { Spring } from 'react-spring/renderprops'

import Input from 'components/data-entry/Input'
import StatusMessage from 'components/general/StatusMessage'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { Status } from 'store/types'
import { useSelector } from 'utils/reducer'

import styles from './ConfirmCredentials.module.css'
import { getConfirmCredentialsStatus } from './store/selectors'
import { confirmCredentials } from './store/slice'

type ConfirmCredentialsProps = {
  isMobile: boolean
  onComplete: (credentials: { email: string; password: string }) => void
}

const messages = {
  emailPlaceholder: 'Email',
  passwordPlaceholder: 'Current Password',
  continueButtonText: 'Continue',
  error: 'Invalid Credentials'
}

export const ConfirmCredentials = (props: ConfirmCredentialsProps) => {
  const { isMobile, onComplete } = props

  const dispatch = useDispatch()
  const status = useSelector(getConfirmCredentialsStatus)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorSeen, setErrorSeen] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const onEmailChange = (newEmail: string) => {
    setEmail(newEmail)
  }

  const onPasswordChange = (newPassword: string) => {
    setPassword(newPassword)
  }

  const onKeyDown = () => {
    setErrorSeen(true)
  }

  const onSubmit = () => {
    setErrorSeen(false)
    setHasSubmitted(true)
    dispatch(confirmCredentials({ email, password }))
  }

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  useEffect(() => {
    if (hasSubmitted) {
      if (status === Status.SUCCESS) {
        setHasSubmitted(false)
        onComplete({ email, password })
      } else if (status === Status.ERROR) {
        setHasSubmitted(false)
      }
    }
  }, [onComplete, setHasSubmitted, hasSubmitted, email, password, status])

  return (
    <form onSubmit={onFormSubmit}>
      <Input
        placeholder={messages.emailPlaceholder}
        size='medium'
        type='email'
        name='email'
        autoComplete='username'
        value={email}
        variant={isMobile ? 'normal' : 'elevatedPlaceholder'}
        onChange={onEmailChange}
        onKeyDown={onKeyDown}
        className={styles.signInInput}
        disabled={status === Status.LOADING}
      />
      <Input
        placeholder={messages.passwordPlaceholder}
        size='medium'
        name='password'
        autoComplete='current-password'
        value={password}
        type='password'
        variant={isMobile ? 'normal' : 'elevatedPlaceholder'}
        onChange={onPasswordChange}
        onKeyDown={onKeyDown}
        className={styles.signInInput}
        disabled={status === Status.LOADING}
      />
      {status === Status.ERROR && !errorSeen && (
        <Spring
          from={{ opacity: 0 }}
          to={{ opacity: 1 }}
          config={{ duration: 1000 }}
        >
          {animProps => (
            <StatusMessage
              status='error'
              containerStyle={animProps}
              containerClassName={styles.errorContainer}
              label={messages.error}
            />
          )}
        </Spring>
      )}
      <Button
        className={styles.continueButton}
        text={messages.continueButtonText}
        rightIcon={
          status === Status.LOADING ? (
            <LoadingSpinner className={styles.spinner} />
          ) : (
            <IconArrow />
          )
        }
        isDisabled={status === Status.LOADING}
        type={
          status === Status.LOADING ? ButtonType.DISABLED : ButtonType.PRIMARY
        }
        onClick={onSubmit}
      />
    </form>
  )
}
