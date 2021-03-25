import {
  IconCrown,
  IconDashboard,
  IconKebabHorizontal,
  IconSettings
} from '@audius/stems'
import IconPopup from 'components/general/IconPopup'
import { useNavigateToPage } from 'hooks/useNavigateToPage'
import React from 'react'
import { AUDIO_PAGE, DASHBOARD_PAGE, SETTINGS_PAGE } from 'utils/route'
import styles from './NavIconPopover.module.css'

const messages = {
  preferences: 'Preferences',
  dashboard: 'Artist Dashboard',
  audio: '$AUDIO & Rewards'
}

const NavIconPopover = () => {
  const navigate = useNavigateToPage()
  const menuItems = [
    {
      text: messages.preferences,
      onClick: () => navigate(SETTINGS_PAGE),
      icon: <IconSettings />
    },
    {
      text: messages.dashboard,
      onClick: () => navigate(DASHBOARD_PAGE),
      icon: <IconDashboard />
    },
    {
      text: messages.audio,
      onClick: () => navigate(AUDIO_PAGE),
      className: styles.rewardsMenu,
      menuIconClassName: styles.crownIcon,
      icon: <IconCrown />
    }
  ]
  return (
    <div className={styles.headerIconWrapper}>
      <IconPopup
        menu={{ items: menuItems }}
        icon={<IconKebabHorizontal />}
        iconClassName={styles.headerIconWrapper}
        menuClassName={styles.menu}
        menuIconClassName={styles.menuIcon}
        position='bottomRight'
      />
    </div>
  )
}

export default NavIconPopover
