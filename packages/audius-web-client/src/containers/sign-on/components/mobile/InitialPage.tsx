import React, {
  useCallback,
  useState,
  useContext,
  useEffect,
  useRef
} from 'react'
import Spin from 'antd/lib/spin'
import { Button, ButtonType, IconArrow } from '@audius/stems'

import Input from 'components/data-entry/Input'
import cn from 'classnames'
import { Spring } from 'react-spring/renderprops'
import StatusMessage from 'components/general/StatusMessage'
import audiusLogoHorizontal from 'assets/img/Horizontal-Logo-Full-Color.png'
import djBackgroundImage from 'assets/img/2-DJ-4-3.jpg'
import signupCtaImage from 'assets/img/signUpCTA.png'
import { RouterContext } from 'containers/animated-switch/RouterContextProvider'
import styles from './InitialPage.module.css'
import PreloadImage from 'components/preload-image/PreloadImage'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

const messages = {
  title: 'Sign Up For Audius',
  header1: 'Stream the music you love.',
  header2: 'Support the artists you care about.',
  signinDescription: 'Sign Into Your Audius Account',
  signUp: 'Sign Up',
  signIn: 'Sign In'
}

const errorMessages = {
  characters: 'Please enter a valid email',
  inUse: 'Email is already in use, please sign-in'
}

const signInErrorMessages = {
  inUse: 'Invalid password',
  default: 'Invalid Credentials'
}

type Status = 'editing' | 'failure' | 'loading' | 'success'

type SignUpEmailProps = {
  email: {
    value: string
    error: string
    status: Status
  }
  onEmailChange: (email: string) => void
  onViewSignIn: () => void
  onNextPage: () => void
}

type SignInProps = {
  hasAccount: boolean
  email: {
    value: string
    error: string
    status: Status
  }
  password: {
    value: string
    error: string
    status: Status
  }
  onViewSignUp: () => void
  onSubmitSignIn: (email: string, password: string) => void
  onEmailChange: (email: string) => void
  onPasswordChange: (password: string) => void
  onAllowNotifications: () => void
  isLoading: boolean
  didSucceed: boolean
}

type InitialPageProps = SignUpEmailProps &
  SignInProps & {
    isSignIn: boolean
    onViewSignIn: () => void
    onSubmitSignIn: (email: string, password: string) => void
    onViewSignUp: () => void
  }

const SignUpEmail = ({
  email,
  onEmailChange,
  onNextPage,
  onViewSignIn
}: SignUpEmailProps) => {
  const { value: emailValue, status: emailStatus, error } = email

  const [attempted, setAttempted] = useState(false)

  const onBlur = useCallback(() => {
    setAttempted(true)
  }, [setAttempted])

  const onSubmitEmail = useCallback(() => {
    setAttempted(true)
    if (!emailValue) onEmailChange(emailValue)
    if (emailStatus === 'success') {
      onNextPage()
    }
  }, [emailValue, emailStatus, setAttempted, onNextPage, onEmailChange])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.keyCode === 13 /** enter */) {
        onSubmitEmail()
      }
    },
    [onSubmitEmail]
  )

  const inputError = email.status === 'failure'
  const validInput = email.status === 'success'
  const showError =
    (inputError && error === 'inUse') || (inputError && attempted)

  return (
    <div className={styles.topContainer}>
      <PreloadImage
        src={audiusLogoHorizontal}
        className={styles.logo}
        alt='Audius Colored Logo'
      />
      <h1 className={cn(styles.title)}>{messages.title}</h1>
      <div className={cn(styles.header)}>
        <h2 className={styles.text}>{messages.header1}</h2>
        <h2 className={styles.text}>{messages.header2}</h2>
      </div>
      <Input
        placeholder='Email'
        type='email'
        name='email'
        variant={'normal'}
        size='medium'
        value={email.value}
        onChange={onEmailChange}
        onKeyDown={onKeyDown}
        className={cn(styles.signUpInput, styles.inputField, {
          [styles.placeholder]: email.value === '',
          [styles.inputError]: showError,
          [styles.validInput]: validInput
        })}
        error={showError}
        onBlur={onBlur}
      />
      {showError ? (
        <Spring
          from={{ opacity: 0 }}
          to={{ opacity: 1 }}
          config={{ duration: 200 }}
        >
          {animProps => (
            <StatusMessage
              status='error'
              label={(errorMessages as any)[error]}
              containerStyle={animProps}
              containerClassName={cn(styles.errorMessage)}
              isClickable={error === 'inUse'}
              onClick={error === 'inUse' ? onViewSignIn : () => {}}
            />
          )}
        </Spring>
      ) : null}
      <Button
        text={messages.signUp}
        name='continue'
        rightIcon={<IconArrow />}
        type={ButtonType.PRIMARY_ALT}
        onClick={onSubmitEmail}
        className={styles.signUpButton}
        textClassName={styles.signUpButtonText}
      />
    </div>
  )
}

const SignIn = ({
  email,
  password,
  onSubmitSignIn,
  onEmailChange,
  onPasswordChange,
  isLoading,
  didSucceed,
  hasAccount,
  onAllowNotifications
}: SignInProps) => {
  const { setStackReset } = useContext(RouterContext)
  const signInError = password.error
  const errorMessage =
    signInErrorMessages[email.error === 'inUse' ? 'inUse' : 'default']

  const onValidateEmailChange = (email: string) => {
    onEmailChange(email)
  }

  const onSignIn = useCallback(() => {
    setStackReset(true)
    onSubmitSignIn(email.value, password.value)
  }, [onSubmitSignIn, email, password, setStackReset])

  useEffect(() => {
    if (didSucceed) {
      onAllowNotifications()
    }
  }, [didSucceed, onAllowNotifications])

  return (
    <div className={styles.topContainer}>
      <PreloadImage
        src={audiusLogoHorizontal}
        className={styles.logo}
        alt='Audius Colored Logo'
      />
      <select style={{ display: 'none' }} />
      <h1 className={styles.signInDescription}>{messages.signinDescription}</h1>
      <Input
        placeholder='Email'
        size='medium'
        type='email'
        name='email'
        autoComplete='username'
        value={email.value}
        variant={'normal'}
        onChange={onValidateEmailChange}
        className={cn(styles.signInInput, styles.inputField)}
      />
      <Input
        placeholder='Password'
        size='medium'
        name='password'
        autoComplete='current-password'
        value={password.value}
        type='password'
        variant={'normal'}
        onChange={onPasswordChange}
        className={cn(styles.signInInput, styles.inputField)}
      />
      {signInError && (
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
              label={errorMessage}
            />
          )}
        </Spring>
      )}
      <Button
        text='Sign In'
        rightIcon={
          isLoading || (didSucceed && !hasAccount) ? (
            <Spin className={styles.spinner} />
          ) : (
            <IconArrow />
          )
        }
        type={ButtonType.PRIMARY_ALT}
        onClick={onSignIn}
        className={styles.signInButton}
        textClassName={styles.signInButtonText}
      />
    </div>
  )
}

export const InitialPage = ({
  isSignIn,
  email,
  password,
  isLoading,
  didSucceed,
  onEmailChange,
  onPasswordChange,
  onViewSignIn,
  onSubmitSignIn,
  onViewSignUp,
  onNextPage,
  onAllowNotifications,
  hasAccount
}: InitialPageProps) => {
  const topAreaRef = useRef<HTMLDivElement>(null)
  const bottomLinkRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    setImmediate(() => {
      if (topAreaRef.current) {
        topAreaRef.current.style.opacity = '1.0'
      }
      if (bottomLinkRef.current) {
        bottomLinkRef.current.style.opacity = '1.0'
      }
    })
  }, [topAreaRef, bottomLinkRef])
  return (
    <div
      className={cn(styles.container, {
        [styles.native]: NATIVE_MOBILE
      })}
    >
      <div className={styles.topSection}>
        <div className={styles.topSectionTransition} ref={topAreaRef}>
          {isSignIn ? (
            <SignIn
              hasAccount={hasAccount}
              didSucceed={didSucceed}
              isLoading={isLoading}
              email={email}
              password={password}
              onSubmitSignIn={onSubmitSignIn}
              onPasswordChange={onPasswordChange}
              onEmailChange={onEmailChange}
              onAllowNotifications={onAllowNotifications}
              onViewSignUp={onViewSignUp}
            />
          ) : (
            <SignUpEmail
              email={email}
              onEmailChange={onEmailChange}
              onViewSignIn={onViewSignIn}
              onNextPage={onNextPage}
            />
          )}
        </div>
      </div>
      <div
        className={styles.bottomContainer}
        style={{
          backgroundImage: `radial-gradient(circle, rgba(91,35,225,0.8) 0%, rgba(113,41,230,0.64) 67.96%, rgba(162,47,235,0.5) 100%), url(${djBackgroundImage})`
        }}
      >
        <div className={styles.featuresImage}>
          <div style={{ backgroundImage: `url(${signupCtaImage})` }} />
        </div>
        <div className={styles.switchView}>
          <div ref={bottomLinkRef}>
            {isSignIn ? (
              <div className={styles.hasAccount}>
                New to Audius?{' '}
                <span className={styles.signInText} onClick={onViewSignUp}>
                  Create an Account
                </span>
              </div>
            ) : (
              <div className={styles.hasAccount}>
                Already have an account?{' '}
                <span className={styles.signInText} onClick={onViewSignIn}>
                  Sign In
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InitialPage
