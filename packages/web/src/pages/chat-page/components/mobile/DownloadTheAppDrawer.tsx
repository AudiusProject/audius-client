import { useCallback, useEffect, useState } from 'react'

import { MobileOS } from '@audius/common'
import {
  AudiusLogoGlyph,
  Button,
  ButtonType,
  IconListens,
  IconMessage,
  IconStars,
  IconUpload,
  IconVolume
} from '@audius/stems'
import { goBack } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import Drawer from 'components/drawer/Drawer'
import { getMobileOS } from 'utils/clientUtil'
import {
  ANDROID_PLAY_STORE_LINK,
  IOS_APP_STORE_LINK,
  IOS_WEBSITE_STORE_LINK
} from 'utils/route'

import styles from './DownloadTheAppDrawer.module.css'

const messages = {
  header: 'Download the App',
  subheader: 'Download the Audius App & never miss a beat! ',
  audioQuality: 'Enjoy stunning audio quality',
  exclusiveContent: 'Access exclusive content',
  message: 'Message & connect with fans',
  upload: 'Upload Your Music on the go',
  download: 'Download & listen offline',
  buttonText: 'Download The App'
}

export const DownloadTheAppDrawer = () => {
  const dispatch = useDispatch()
  const [isOpen, setIsOpen] = useState(false)

  const handleClose = useCallback(() => {
    dispatch(goBack())
  }, [dispatch])

  const goToAppStore = useCallback(() => {
    switch (getMobileOS()) {
      case MobileOS.IOS:
        window.location.href = IOS_APP_STORE_LINK
        break
      case MobileOS.ANDROID:
        window.location.href = ANDROID_PLAY_STORE_LINK
        break
      default:
        window.location.href = IOS_WEBSITE_STORE_LINK
        break
    }
  }, [])

  // Simply hardcoding "true" will never pop up the drawer,
  // probably due to some inner workings of the animation.
  // Let it render first as closed, then open it immediately after.
  useEffect(() => {
    setTimeout(() => setIsOpen(true), 0)
  }, [setIsOpen])
  return (
    <Drawer isOpen={isOpen} onClose={handleClose}>
      <div className={styles.root}>
        <h4 className={styles.header}>
          <AudiusLogoGlyph className={styles.logoIcon} />
          {messages.header}
        </h4>
        <div className={styles.subheader}>{messages.subheader}</div>
        <ul className={styles.features}>
          <li>
            <IconVolume className={styles.icon} />{' '}
            <span>{messages.audioQuality}</span>
          </li>
          <li>
            <IconStars className={styles.icon} />
            <span>{messages.exclusiveContent}</span>
          </li>
          <li>
            <IconMessage className={styles.icon} />
            <span>{messages.message}</span>
          </li>
          <li>
            <IconUpload className={styles.icon} />
            <span>{messages.upload}</span>
          </li>
          <li>
            <IconListens className={styles.icon} />
            <span>{messages.download}</span>
          </li>
        </ul>
        <Button
          type={ButtonType.PRIMARY_ALT}
          text={messages.buttonText}
          onClick={goToAppStore}
        />
      </div>
    </Drawer>
  )
}
