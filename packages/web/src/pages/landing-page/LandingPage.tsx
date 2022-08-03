import { useState, useEffect, useCallback } from 'react'

import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'
import cn from 'classnames'
import { ParallaxProvider } from 'react-scroll-parallax'

import AppRedirectPopover from 'components/app-redirect-popover/components/AppRedirectPopover'
import FanburstBanner from 'components/banner/FanburstBanner'
import { CookieBanner } from 'components/cookie-banner/CookieBanner'
import Footer from 'components/public-site/Footer'
import NavBanner from 'components/public-site/NavBanner'
import { shouldShowCookieBanner, dismissCookieBanner } from 'utils/gdpr'
import { getPathname } from 'utils/route'

import styles from './LandingPage.module.css'
import ArtistTestimonials from './components/ArtistTestimonials'
import CTAListening from './components/CTAListening'
import CTASignUp from './components/CTASignUp'
import Description from './components/Description'
import FeaturedContent from './components/FeaturedContent'
import Hero from './components/Hero'
import JoinTheCommunity from './components/JoinTheCommunity'
import PlatformFeatures from './components/PlatformFeatures'
import PlatformTagline from './components/PlatformTagline'

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
    shouldShowCookieBanner().then((show) => {
      setShowCookieBanner(show)
    })
  }, [])

  const onDismissCookiePolicy = useCallback(() => {
    dismissCookieBanner()
    setShowCookieBanner(false)
  }, [])

  // Show fanburst banner if url utm source is present
  const [showFanburstBanner, setShowFanburstBanner] = useState(false)
  useEffect(() => {
    if (
      window.location.search &&
      window.location.search.includes(FANBURST_UTM_SOURCE)
    ) {
      if (window.history && window.history.pushState) {
        window.history.pushState('', '/', getPathname())
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
        <Hero
          isMobile={props.isMobile}
          onImageLoad={onImageLoad}
          setRenderPublicSite={props.setRenderPublicSite}
        />
        <Description isMobile={props.isMobile} />
        <ArtistTestimonials isMobile={props.isMobile} />
        <PlatformFeatures isMobile={props.isMobile} />
        <CTAListening
          isMobile={props.isMobile}
          setRenderPublicSite={props.setRenderPublicSite}
        />
        <FeaturedContent
          isMobile={props.isMobile}
          setRenderPublicSite={props.setRenderPublicSite}
        />
        <PlatformTagline isMobile={props.isMobile} />
        <JoinTheCommunity
          isMobile={props.isMobile}
          setRenderPublicSite={props.setRenderPublicSite}
        />
        <CTASignUp
          isMobile={props.isMobile}
          setRenderPublicSite={props.setRenderPublicSite}
        />
        <Footer
          isMobile={props.isMobile}
          setRenderPublicSite={props.setRenderPublicSite}
        />
      </div>
    </ParallaxProvider>
  )
}

export default LandingPage
