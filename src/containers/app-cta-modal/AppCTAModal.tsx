import React, { useCallback } from 'react'

import { Modal, Button, IconDownload, ButtonType } from '@audius/stems'
import { useDispatch } from 'react-redux'

import QRCode from 'assets/img/imageQR.png'
import { Name } from 'common/models/Analytics'
import DownloadApp from 'services/download-app/DownloadApp'
import { make } from 'store/analytics/actions'
import { setVisibility } from 'store/application/ui/app-cta-modal/slice'
import { getOS } from 'utils/clientUtil'
import { useSelector } from 'utils/reducer'

import styles from './AppCTAModal.module.css'

const messages = {
  title: 'Get The Audius Mobile App',
  subtitle: 'Scan This Code With Your Phone Camera To Get The Mobile App',
  desktop: 'Download The Audius Desktop App',
  dividerWord: 'and',
  buttonLabel: 'Download'
}

const Divider = () => (
  <div className={styles.dividerContainer}>
    <div className={styles.divider} />
    <div className={styles.dividerWord}>{messages.dividerWord}</div>
    <div className={styles.divider} />
  </div>
)

const os = getOS()

const useCallbacks = () => {
  const dispatch = useDispatch()

  const isOpen = useSelector(state => state.application.ui.appCTAModal.isOpen)

  const recordDownloadDesktopApp = useCallback(() => {
    dispatch(make(Name.ACCOUNT_HEALTH_DOWNLOAD_DESKTOP, { source: 'banner' }))
  }, [dispatch])

  const onClose = useCallback(
    () => dispatch(setVisibility({ isOpen: false })),
    [dispatch]
  )

  const downloadDesktopApp = useCallback(() => {
    if (!os) return
    DownloadApp.start(os)
    recordDownloadDesktopApp()
  }, [recordDownloadDesktopApp])

  return { isOpen, downloadDesktopApp, onClose }
}

/**
 * Modal that presents a CTA to download the Audius apps.
 */
const AppCTAModal = () => {
  const { isOpen, downloadDesktopApp, onClose } = useCallbacks()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={messages.title}
      bodyClassName={styles.modal}
      showTitleHeader
      showDismissButton
      contentHorizontalPadding={16}
      allowScroll
    >
      <div className={styles.container}>
        <img className={styles.qr} src={QRCode} alt='QR Code' />
        <div className={styles.subtitle}>{messages.subtitle}</div>
        <Divider />
        <div className={styles.desktop}>{messages.desktop}</div>
        <div className={styles.buttonContainer}>
          <Button
            text={messages.buttonLabel}
            rightIcon={<IconDownload />}
            type={ButtonType.PRIMARY_ALT}
            onClick={downloadDesktopApp}
            textClassName={styles.downloadButtonText}
            className={styles.downloadButton}
          />
        </div>
      </div>
    </Modal>
  )
}
export default AppCTAModal
