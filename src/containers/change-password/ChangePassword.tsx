import React, { useCallback, useEffect, useState } from 'react'

import { Button, IconLock } from '@audius/stems'
import cn from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import LoadingSpinnerFullPage from 'components/loading-spinner-full-page/LoadingSpinnerFullPage'
import EnterPassword from 'components/sign-on/EnterPassword'
import { Status } from 'store/types'

import styles from './ChangePassword.module.css'
import { ConfirmCredentials } from './ConfirmCredentials'
import { getChangePasswordStatus, getCurrentPage } from './store/selectors'
import { changePage, changePassword, Page } from './store/slice'

const messages = {
  helpTexts: [
    'Please enter your email and current password.',
    'Create A New Password That Is\n Secure And Easy To Remember!',
    'Changing Password, Please wait',
    'Your Password Has Been Changed',
    <span key={Page.FAILURE} className={styles.error}>
      Something went wrong. Please try again.
    </span>
  ],
  changePassword: 'Change Password'
}

type ChangePasswordProps = {
  isMobile: boolean
  onComplete: () => void
}

export const ChangePassword = ({
  isMobile,
  onComplete
}: ChangePasswordProps) => {
  const [email, setEmail] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const dispatch = useDispatch()

  const changePasswordStatus = useSelector(getChangePasswordStatus)
  const currentPage = useSelector(getCurrentPage)

  const onCredentialsConfirmed = ({
    email,
    password
  }: {
    email: string
    password: string
  }) => {
    setEmail(email)
    setOldPassword(password)
    setCurrentPage(Page.NEW_PASSWORD)
  }

  const onNewPasswordSubmitted = (password: string) => {
    setNewPassword(password)
    dispatch(changePassword({ email, password, oldPassword }))
  }

  const setCurrentPage = useCallback(
    (page: Page) => {
      dispatch(changePage(page))
    },
    [dispatch]
  )

  useEffect(() => {
    if (changePasswordStatus === Status.LOADING) {
      setCurrentPage(Page.LOADING)
    } else if (
      currentPage === Page.LOADING &&
      changePasswordStatus === Status.SUCCESS
    ) {
      setCurrentPage(Page.SUCCESS)
    } else if (
      currentPage === Page.LOADING &&
      changePasswordStatus === Status.ERROR
    ) {
      setCurrentPage(Page.FAILURE)
    }
  }, [changePasswordStatus, currentPage, setCurrentPage])

  const getPageContents = () => {
    switch (currentPage) {
      case Page.NEW_PASSWORD:
        return (
          <EnterPassword
            continueLabel={messages.changePassword}
            continueIcon={<IconLock />}
            isMobile={true}
            onSubmit={onNewPasswordSubmitted}
          />
        )
      case Page.LOADING:
        return <LoadingSpinnerFullPage />
      case Page.FAILURE:
      case Page.SUCCESS:
        return <Button text='Done' onClick={onComplete} />
      default:
        return (
          <ConfirmCredentials
            isMobile={isMobile}
            onComplete={onCredentialsConfirmed}
          />
        )
    }
  }
  return (
    <div
      className={
        isMobile ? cn(styles.content, styles.isMobile) : styles.content
      }
    >
      {currentPage === Page.CONFIRM_CREDENTIALS && isMobile ? (
        <>
          <div className={styles.headerText}>{messages.changePassword}</div>
          <div className={styles.helpText}>
            {messages.helpTexts[currentPage]}
          </div>
        </>
      ) : (
        <div className={styles.headerText}>
          {messages.helpTexts[currentPage]}
        </div>
      )}
      {getPageContents()}
    </div>
  )
}
