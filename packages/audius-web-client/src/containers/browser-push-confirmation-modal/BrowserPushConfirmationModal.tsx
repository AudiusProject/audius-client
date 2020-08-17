import React, { useState, useCallback, useEffect } from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import Modal, { Anchor } from 'components/general/AudiusModal'
import { isElectron, isMobile } from 'utils/clientUtil'
import cn from 'classnames'
import { Button, ButtonType, ButtonSize } from '@audius/stems'

import { AppState } from 'store/types'
import { getIsOpen } from 'store/application/ui/browserPushPermissionConfirmation/selectors'
import { close as closeModal } from 'store/application/ui/browserPushPermissionConfirmation/actions'
import * as settingPageActions from 'containers/settings-page/store/actions'
import { subscribeBrowserPushNotifications } from 'store/account/reducer'
import {
  isPushManagerAvailable,
  isSafariPushAvailable,
  subscribeSafariPushBrowser,
  Permission
} from 'utils/browserNotifications'
import { getBrowserNotificationSettings } from 'containers/settings-page/store/selectors'
import styles from './styles.module.css'

type BrowerPushConfirmationModal = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

const messages = {
  title: (
    <span>
      {'DON’T MISS A THING! '}
      <span className={styles.bell}>
        <i className='emoji bell' />
      </span>
    </span>
  ),
  description:
    'Turn on browser notifications to be notified when your favorite artists release new content!',
  reason:
    'You’ll also be notified whenever someone follows, reposts, or favorites your tracks!',
  close: 'Maybe Later',
  confirm: 'Enable Browser Notifications!'
}

/**
 * A modal that asks the user to condfirm browser notifications
 */
const ConnectedBrowserPushConfirmationModal = ({
  isOpen,
  onClose,
  browserNotificationSettings,
  setBrowserNotificationPermission,
  subscribeBrowserPushNotifications
}: BrowerPushConfirmationModal) => {
  const { permission } = browserNotificationSettings
  const [pushPermission] = useState(permission)

  const onEnabled = useCallback(() => {
    let cancelled = false
    if (permission !== Permission.DENIED) {
      if (isPushManagerAvailable) {
        subscribeBrowserPushNotifications()
        if (permission === Permission.GRANTED) onClose()
      } else if (isSafariPushAvailable) {
        // NOTE: The request browser permission must be done directly
        // b/c safari requires the user action to trigger the premission request
        if (permission === Permission.GRANTED) {
          subscribeBrowserPushNotifications()
        } else {
          const getSafariPermission = async () => {
            const permissionData = await subscribeSafariPushBrowser()
            if (
              permissionData &&
              permissionData.permission === Permission.GRANTED
            ) {
              subscribeBrowserPushNotifications()
              if (!cancelled) onClose()
            } else if (
              permissionData &&
              permissionData.permission === Permission.DENIED
            ) {
              setBrowserNotificationPermission(Permission.DENIED)
            }
          }
          getSafariPermission()
        }
      }
    }
    return () => {
      cancelled = true
    }
  }, [
    permission,
    subscribeBrowserPushNotifications,
    onClose,
    setBrowserNotificationPermission
  ])

  // If permission changed, close modal
  useEffect(() => {
    if (permission && pushPermission && permission !== pushPermission) {
      onClose()
    }
  }, [permission, pushPermission, onClose])

  return (
    <Modal
      showTitleHeader
      showDismissButton
      onClose={onClose}
      isOpen={isOpen && !isElectron()}
      anchor={Anchor.CENTER}
      title={messages.title}
      titleClassName={styles.title}
      wrapperClassName={cn(styles.wrapperClassName, {
        [styles.mobile]: isMobile()
      })}
      headerContainerClassName={styles.headerContainerClassName}
      bodyClassName={styles.modalBody}
      contentHorizontalPadding={24}
      allowScroll={false}
    >
      <div>
        <div className={styles.textBody}>
          <div className={styles.description}>{messages.description}</div>
          <div className={styles.reason}>{messages.reason}</div>
        </div>

        <div className={styles.buttons}>
          <Button
            className={styles.closeButton}
            text={messages.close.toUpperCase()}
            size={ButtonSize.MEDIUM}
            type={ButtonType.COMMON}
            onClick={onClose}
          />
          <Button
            className={styles.enableButton}
            text={messages.confirm.toUpperCase()}
            size={ButtonSize.MEDIUM}
            type={ButtonType.PRIMARY_ALT}
            onClick={onEnabled}
          />
        </div>
      </div>
    </Modal>
  )
}

function mapStateToProps(state: AppState) {
  return {
    isOpen: getIsOpen(state),
    browserNotificationSettings: getBrowserNotificationSettings(state)
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    subscribeBrowserPushNotifications: () =>
      dispatch(subscribeBrowserPushNotifications()),
    setBrowserNotificationPermission: (permission: Permission) =>
      dispatch(settingPageActions.setBrowserNotificationPermission(permission)),
    setBrowserNotificationEnabled: (enabled: boolean) =>
      dispatch(settingPageActions.setBrowserNotificationEnabled(enabled)),
    setNotificationSettings: (settings: object) =>
      dispatch(settingPageActions.setNotificationSettings(settings)),
    onClose: () => dispatch(closeModal())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedBrowserPushConfirmationModal)
