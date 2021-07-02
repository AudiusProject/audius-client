import React from 'react'

import {
  IconCrown,
  IconDashboard,
  IconSettings,
  PopupMenu,
  PopupPosition
} from '@audius/stems'
import { ReactComponent as IconKebabHorizontal } from 'assets/img/iconKebabHorizontalAlt.svg'
import { useNavigateToPage } from 'hooks/useNavigateToPage'
import { getAccountIsCreator } from 'store/account/selectors'
import { useSelector } from 'utils/reducer'
import { AUDIO_PAGE, DASHBOARD_PAGE, SETTINGS_PAGE } from 'utils/route'
import { removeNullable } from 'utils/typeUtils'

import styles from './NavIconPopover.module.css'

const messages = {
  settings: 'Settings',
  dashboard: 'Artist Dashboard',
  audio: '$AUDIO & Rewards'
}

const useIsCreator = () => {
  return useSelector(getAccountIsCreator)
}

const NavIconPopover = () => {
  const navigate = useNavigateToPage()
  const isCreator = useIsCreator()

  const menuItems = [
    {
      text: messages.settings,
      onClick: () => navigate(SETTINGS_PAGE),
      icon: <IconSettings />
    },
    isCreator
      ? {
          text: messages.dashboard,
          onClick: () => navigate(DASHBOARD_PAGE),
          icon: <IconDashboard />
        }
      : null,
    {
      text: messages.audio,
      onClick: () => navigate(AUDIO_PAGE),
      className: styles.rewardsMenu,
      icon: (
        <div className={styles.crownIcon}>
          <IconCrown />
        </div>
      )
    }
  ].filter(removeNullable)

  return (
    <div className={styles.headerIconWrapper}>
      <PopupMenu
        items={menuItems}
        position={PopupPosition.BOTTOM_RIGHT}
        renderTrigger={(anchorRef, triggerPopup) => {
          return (
            <div className={styles.icon}>
              <IconKebabHorizontal ref={anchorRef} onClick={triggerPopup} />
            </div>
          )
        }}
        zIndex={15}
      />
    </div>
  )
}

export default NavIconPopover
