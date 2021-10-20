import React, { useCallback, useEffect, useState } from 'react'

import { Button, IconMail } from '@audius/stems'
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
    "We couldn't change your password"
  ],
  changePassword: 'Change Password'
}

type ChangePasswordProps = {
  onComplete: () => {}
}

export const ChangePassword = ({ onComplete }: ChangePasswordProps) => {
  const isMobile = false
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

  const retry = useCallback(() => {
    dispatch(changePassword({ email, password: newPassword, oldPassword }))
  }, [dispatch, email, newPassword, oldPassword])

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
            continueIcon={<IconMail />}
            isMobile={false}
            onSubmit={onNewPasswordSubmitted}
          />
        )
      case Page.LOADING:
        return <LoadingSpinnerFullPage />
      case Page.FAILURE:
        return <Button text='Try again' onClick={retry} />
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
    <div className={styles.content}>
      <div className={styles.helpText}>{messages.helpTexts[currentPage]}</div>
      {getPageContents()}
    </div>
  )
}
