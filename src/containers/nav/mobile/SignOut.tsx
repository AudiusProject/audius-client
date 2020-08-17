import React, { useCallback } from 'react'
import cn from 'classnames'
import { Button, ButtonType } from '@audius/stems'

import { signOut } from 'utils/signOut'
import { make, useRecord } from 'store/analytics/actions'
import { Name } from 'services/analytics'
import { disablePushNotifications } from 'containers/settings-page/store/mobileSagas'

import styles from './SignOut.module.css'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

const messages = {
  nevermind: 'NEVERMIND',
  signOut: 'Sign Out',
  signOutButton: 'SIGN OUT',
  confirmSignOut: 'Are you sure you want to sign out?',
  warning:
    'Double check that you have an account recovery email just in case (resend from your settings).'
}

const SignOutPage = ({ onClickBack }: { onClickBack: () => void }) => {
  const record = useRecord()
  const onSignOut = useCallback(async () => {
    if (NATIVE_MOBILE) {
      await disablePushNotifications()
      record(make(Name.SETTINGS_LOG_OUT, {}))
      signOut()
    } else {
      record(make(Name.SETTINGS_LOG_OUT, { callback: signOut }))
    }
  }, [record])

  return (
    <div className={styles.signOut}>
      <div>{messages.confirmSignOut}</div>
      <div>{messages.warning}</div>
      <Button
        type={ButtonType.PRIMARY_ALT}
        className={cn(styles.nevermindButton, styles.signOutButtons)}
        textClassName={styles.signOutButtonText}
        text={messages.nevermind}
        onClick={onClickBack}
      />
      <Button
        type={ButtonType.COMMON}
        className={styles.signOutButtons}
        textClassName={styles.signOutButtonText}
        text={messages.signOutButton}
        onClick={onSignOut}
      />
    </div>
  )
}

export default SignOutPage
