import { useCallback, useEffect, useState } from 'react'

import { MobileOS, OS } from '@audius/common'
import { IconDownload } from '@audius/stems'
import cn from 'classnames'
import * as queryString from 'query-string'
import { useLocation } from 'react-router-dom'
import { ParallaxProvider } from 'react-scroll-parallax'

import { ReactComponent as IconDownloadDesktop } from 'assets/img/publicSite/downloadDesktop.svg'
import { ReactComponent as IconDownloadMobile } from 'assets/img/publicSite/downloadMobile.svg'
import { CookieBanner } from 'components/cookie-banner/CookieBanner'
import Footer from 'components/public-site/Footer'
import NavBanner from 'components/public-site/NavBanner'
import CTASignUp from 'pages/landing-page/components/CTASignUp'
import DownloadApp from 'services/download-app/DownloadApp'
import { getIOSAppLink } from 'utils/appLinks'
import { getOS } from 'utils/clientUtil'
import { dismissCookieBanner, shouldShowCookieBanner } from 'utils/gdpr'
import { ANDROID_PLAY_STORE_LINK } from 'utils/route'

import styles from './DownloadPage.module.css'
import DownloadStartingMessage from './components/DownloadStartingMessage'

const messages = {
  downloadTitle: 'Download the Audius App',
  downloadSubtitle:
    'Looking for the best experience? Check out the Audius App ',
  getMobileApp: 'Get the mobile app',
  getDesktopApp: 'Get the desktop app',
  getDesktopAppSubtitle: 'The definitive Audius Experience',
  getMobileAppSubtitle: 'Available for iOS & Android Devices',
  getFor: 'Get for'
}
type DownloadPageProps = {
  isMobile: boolean
  openNavScreen: () => void
  setRenderPublicSite: (shouldRender: boolean) => void
}

const os = getOS()
const iOSDownloadLink = getIOSAppLink()

const DesktopDownloadButton = ({ os }: { os: OS }) => {
  let platformName
  if (os === OS.WIN) {
    platformName = 'Windows'
  } else if (os === OS.MAC) {
    platformName = 'Mac'
  } else {
    platformName = 'Linux'
  }
  return (
    <div className={styles.downloadLinkWrapper}>
      <button
        onClick={() => DownloadApp.start(os)}
        className={styles.downloadLink}
      >
        {messages.getFor}{' '}
        <span className={styles.platformName}>
          <IconDownload className={styles.platformIcon} />
          {platformName}
        </span>
      </button>
    </div>
  )
}

const AppDownloadLink = ({ os }: { os: MobileOS }) => {
  let platformName, downloadLink
  if (os === MobileOS.IOS) {
    platformName = 'iOS'
    downloadLink = iOSDownloadLink
  } else if (os === MobileOS.ANDROID) {
    platformName = 'Android'
    downloadLink = ANDROID_PLAY_STORE_LINK
  }

  return (
    <div className={styles.downloadLinkWrapper}>
      <a href={downloadLink} className={styles.downloadLink}>
        {messages.getFor}{' '}
        <span className={styles.platformName}>
          <IconDownload className={styles.platformIcon} />
          {platformName}
        </span>
      </a>
    </div>
  )
}

const DownloadPage = (props: DownloadPageProps) => {
  useEffect(() => {
    document.documentElement.style.height = 'auto'
    return () => {
      document.documentElement.style.height = ''
    }
  })

  const { search } = useLocation()
  const { start_download } = queryString.parse(search)

  const downloadDesktopApp = useCallback(() => {
    if (!os) return
    DownloadApp.start(os)
  }, [])

  useEffect(() => {
    if (start_download) {
      downloadDesktopApp()
    }
  }, [downloadDesktopApp, start_download])
  const [showCookieBanner, setShowCookieBanner] = useState(false)
  useEffect(() => {
    shouldShowCookieBanner().then((show) => {
      setShowCookieBanner(show)
    })
  }, [])

  const onDismissCookiePolicy = useCallback(() => {
    dismissCookieBanner()
    setShowCookieBanner(false)
  }, [])

  return (
    <ParallaxProvider>
      <div
        id='downloadPage'
        className={cn(styles.container, { [styles.isMobile]: props.isMobile })}
      >
        {showCookieBanner && (
          <CookieBanner
            isMobile={props.isMobile}
            isPlaying={false}
            // @ts-ignore
            dismiss={onDismissCookiePolicy}
          />
        )}
        <NavBanner
          invertColors
          className={cn({
            [styles.isMobile]: props.isMobile
          })}
          isMobile={props.isMobile}
          openNavScreen={props.openNavScreen}
          setRenderPublicSite={props.setRenderPublicSite}
        />
        <div className={styles.content}>
          {start_download && os ? <DownloadStartingMessage /> : null}
          <div className={styles.downloadsSection}>
            <div className={styles.titleContainer}>
              <h1 className={styles.title}>{messages.downloadTitle}</h1>
              <h3 className={styles.subtitle}>{messages.downloadSubtitle}</h3>
            </div>
            <div className={styles.linksContainer}>
              <div className={styles.desktopDownloadsContainer}>
                <div className={styles.platformHeaderIconContainer}>
                  <IconDownloadDesktop />
                </div>
                <h4 className={styles.appTitle}>{messages.getDesktopApp}</h4>
                <span className={styles.appSubtitle}>
                  {messages.getDesktopAppSubtitle}
                </span>
                <div className={styles.downloadLinks}>
                  <DesktopDownloadButton os={OS.MAC} />
                  <DesktopDownloadButton os={OS.WIN} />
                  <DesktopDownloadButton os={OS.LINUX} />
                </div>
              </div>
              <div className={styles.mobileDownloadsContainer}>
                <div className={styles.platformHeaderIconContainer}>
                  <IconDownloadMobile className={cn(styles.mobileIcon)} />
                </div>
                <h4 className={styles.appTitle}>{messages.getMobileApp}</h4>
                <span className={styles.appSubtitle}>
                  {messages.getMobileAppSubtitle}
                </span>
                <div className={styles.downloadLinks}>
                  <AppDownloadLink os={MobileOS.IOS} />
                  <AppDownloadLink os={MobileOS.ANDROID} />
                </div>
              </div>
            </div>
          </div>
          <CTASignUp
            isMobile={props.isMobile}
            setRenderPublicSite={props.setRenderPublicSite}
          />
          <Footer
            isMobile={props.isMobile}
            setRenderPublicSite={props.setRenderPublicSite}
          />
        </div>
      </div>
    </ParallaxProvider>
  )
}

export default DownloadPage
