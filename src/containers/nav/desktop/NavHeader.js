import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import cn from 'classnames'
import {
  HOME_PAGE,
  DASHBOARD_PAGE,
  SETTINGS_PAGE,
  BASE_URL,
  stripBaseUrl
} from 'utils/route'

import NavButton from 'containers/nav/desktop/NavButton'
import NotificationPanel from 'containers/notification/NotificationPanel'

import { ReactComponent as IconDashboard } from 'assets/img/iconDashboard.svg'
import { ReactComponent as IconSettings } from 'assets/img/iconSettings.svg'
import { ReactComponent as IconNotification } from 'assets/img/iconNotification.svg'
import { ReactComponent as AudiusLogoHorizontal } from 'assets/img/audiusLogoHorizontal.svg'
import { formatCount } from 'utils/formatUtil'
import styles from './NavHeader.module.css'
import { useRemoteVar } from 'containers/remote-config/hooks'
import { StringKeys } from 'services/remote-config'

const NavHeader = ({
  account,
  notificationCount,
  notificationPanelIsOpen,
  toggleNotificationPanel,
  goToRoute,
  isElectron
}) => {
  const logoVariant = useRemoteVar(StringKeys.AUDIUS_LOGO_VARIANT)
  const logoVariantClickTarget = useRemoteVar(
    StringKeys.AUDIUS_LOGO_VARIANT_CLICK_TARGET
  )

  const onClickLogo = useCallback(() => {
    if (logoVariantClickTarget) {
      if (logoVariantClickTarget.startsWith(BASE_URL)) {
        goToRoute(stripBaseUrl(logoVariantClickTarget))
      } else {
        const win = window.open(logoVariantClickTarget, '_blank')
        if (win) win.focus()
      }
    } else {
      goToRoute(HOME_PAGE)
    }
  }, [logoVariantClickTarget, goToRoute])

  return (
    <div className={styles.header}>
      <div className={styles.logoWrapper} onClick={onClickLogo}>
        {logoVariant ? (
          <img src={logoVariant} alt='' />
        ) : (
          <AudiusLogoHorizontal className={styles.logo} />
        )}
      </div>
      {account ? (
        <div className={styles.headerIconContainer}>
          <NavLink
            to={SETTINGS_PAGE}
            activeClassName='active'
            className={cn(styles.headerIconWrapper)}
          >
            <IconSettings />
          </NavLink>
          {account.is_creator ? (
            <NavLink
              to={DASHBOARD_PAGE}
              activeClassName='active'
              className={styles.headerIconWrapper}
            >
              <IconDashboard />
            </NavLink>
          ) : null}
          <div
            onClick={toggleNotificationPanel}
            className={cn(styles.headerIconWrapper, styles.iconNotification, {
              [styles.active]: notificationCount > 0,
              [styles.notificationsOpen]: notificationPanelIsOpen
            })}
          >
            <IconNotification />
          </div>
          {notificationCount > 0 && !notificationPanelIsOpen ? (
            <div className={styles.iconTag}>
              {formatCount(notificationCount)}
            </div>
          ) : null}
          <NotificationPanel
            isElectron={isElectron}
            toggleNotificationPanel={toggleNotificationPanel}
          />
        </div>
      ) : null}
    </div>
  )
}

NavButton.propTypes = {
  account: PropTypes.object,
  notificationCount: PropTypes.number,
  notificationPanelIsOpen: PropTypes.bool,
  toggleNotificationPanel: PropTypes.func,
  isElectron: PropTypes.bool,
  goToRoute: PropTypes.func
}

export default NavHeader
