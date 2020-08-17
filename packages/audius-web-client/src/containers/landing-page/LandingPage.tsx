import React, { useState, useEffect, useCallback } from 'react'
import cn from 'classnames'
import styles from './LandingPage.module.css'
import { ParallaxProvider } from 'react-scroll-parallax'

import NavBanner from 'components/public-site/NavBanner'
import Footer from 'components/public-site/Footer'
import { CookieBanner } from 'containers/cookie-banner/CookieBanner'
import FanburstBanner from 'components/banner/FanburstBanner'

import Hero from './components/Hero'
import Description from './components/Description'
import ArtistTestimonials from './components/ArtistTestimonials'
import PlatformFeatures from './components/PlatformFeatures'
import FeaturedContent from './components/FeaturedContent'
import CTAListening from './components/CTAListening'
import PlatformTagline from './components/PlatformTagline'
import JoinTheCommunity from './components/JoinTheCommunity'
import CTASignUp from './components/CTASignUp'

import { shouldShowCookieBanner, dismissCookieBanner } from 'utils/gdpr'
import AppRedirectPopover from 'containers/app-redirect-popover/components/AppRedirectPopover'
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'

const FANBURST_UTM_SOURCE = 'utm_source=fanburst'

const root = document.querySelector('#root')

type LandingPageProps = {
  isMobile: boolean
  openNavScreen: () => void
  onClickAppRedirect: () => void
  onDismissAppRedirect: () => void
  setRenderPublicSite: (shouldRender: boolean) => void
}

const LandingPage = (props: LandingPageProps) => {
  useEffect(() => {
    document.documentElement.style.height = 'auto'
    return () => {
      document.documentElement.style.height = ''
    }
  })

  // Show Cookie Banner if in the EU
  const [showCookieBanner, setShowCookieBanner] = useState(false)
  useEffect(() => {
    shouldShowCookieBanner().then(show => {
      setShowCookieBanner(show)
    })
  }, [])

  const onDismissCookiePolicy = useCallback(() => {
    dismissCookieBanner()
    setShowCookieBanner(false)
  }, [])

  // Show fanburst banner if url hash is present
  const [showFanburstBanner, setShowFanburstBanner] = useState(false)
  useEffect(() => {
    if (
      window.location.search &&
      window.location.search.includes(FANBURST_UTM_SOURCE)
    ) {
      if (window.history && window.history.pushState) {
        window.history.pushState('', '/', window.location.pathname)
      } else {
        window.location.hash = ''
      }
      setShowFanburstBanner(true)
    }
  }, [setShowFanburstBanner])
  const onDismissFanburstBanner = () => setShowFanburstBanner(false)

  const lockBodyScroll = useCallback(() => {
    root && disableBodyScroll(root)
  }, [])

  const unlockBodyScroll = useCallback(() => {
    clearAllBodyScrollLocks()
  }, [])

  const [hasImageLoaded, setHasImageLoaded] = useState(false)
  const onImageLoad = useCallback(() => {
    setHasImageLoaded(true)
  }, [setHasImageLoaded])

  return (
    <ParallaxProvider>
      <div
        id='landingPage'
        className={styles.container}
        style={{ opacity: hasImageLoaded ? 1 : 0 }}
      >
        {showCookieBanner && (
          <CookieBanner
            isMobile={props.isMobile}
            isPlaying={false}
            // @ts-ignore
            dismiss={onDismissCookiePolicy}
          />
        )}
        <AppRedirectPopover
          enablePopover
          onBeforeClickApp={props.onClickAppRedirect}
          onBeforeClickDismissed={props.onDismissAppRedirect}
          incrementScroll={lockBodyScroll}
          decrementScroll={unlockBodyScroll}
        />
        {showFanburstBanner && (
          <FanburstBanner
            isMobile={props.isMobile}
            onClose={onDismissFanburstBanner}
          />
        )}
        <NavBanner
          className={cn({
            [styles.hasBanner]: showFanburstBanner,
            [styles.isMobile]: props.isMobile
          })}
          isMobile={props.isMobile}
          openNavScreen={props.openNavScreen}
          setRenderPublicSite={props.setRenderPublicSite}
        />
        <Hero isMobile={props.isMobile} onImageLoad={onImageLoad} />
        <Description isMobile={props.isMobile} />
        <ArtistTestimonials isMobile={props.isMobile} />
        <PlatformFeatures isMobile={props.isMobile} />
        <FeaturedContent isMobile={props.isMobile} />
        <CTAListening isMobile={props.isMobile} />
        <PlatformTagline isMobile={props.isMobile} />
        <JoinTheCommunity isMobile={props.isMobile} />
        <CTASignUp isMobile={props.isMobile} />
        <Footer isMobile={props.isMobile} />
      </div>
    </ParallaxProvider>
  )
}

export default LandingPage
