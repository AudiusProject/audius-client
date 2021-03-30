import React from 'react'
import { useSelector } from 'react-redux'

import { getIsOpen } from './store/selectors'
import { getKeyboardVisibility } from 'store/application/ui/mobileKeyboard/selectors'

import Drawer from 'components/drawer/Drawer'
import styles from './MobileConnectWalletsDrawer.module.css'

const messages = {
  title: 'Connect Additional Wallets With Your Account',
  visit: 'Visit audius.co from a desktop browser',
  reason:
    'Show off your NFT Collectibles and flaunt your $AUDIO with a VIP badge on your profile.'
}

const MobileConnectWalletsDrawer = ({ onClose }: { onClose: () => void }) => {
  const isOpen = useSelector(getIsOpen)
  const keyboardVisible = useSelector(getKeyboardVisibility)
  return (
    <Drawer isOpen={isOpen} keyboardVisible={keyboardVisible} onClose={onClose}>
      <div className={styles.drawer}>
        <div className={styles.top}>
          <div className={styles.cta}>
            <div>{messages.title}</div>
          </div>
          <div className={styles.visit}>{messages.visit}</div>
        </div>
        <div className={styles.bottom}>{messages.reason}</div>
      </div>
    </Drawer>
  )
}

export default MobileConnectWalletsDrawer
