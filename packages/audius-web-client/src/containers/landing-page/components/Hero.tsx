import React, { useCallback } from 'react'
import cn from 'classnames'
import { Parallax, withController } from 'react-scroll-parallax'

import styles from './Hero.module.css'

import HeroForeground from 'assets/img/publicSite/Hero-Foreground.png'
import HeroForegroundMobile from 'assets/img/publicSite/Hero-Foreground-mobile.png'
import HeroBackground from 'assets/img/publicSite/Hero-Background.jpg'
import HeroBackgroundMobile from 'assets/img/publicSite/Hero-Background-mobile.jpg'
import GlyphPattern from 'assets/img/publicSite/glyph-pattern.png'
import { ReactComponent as IconArrow } from 'assets/img/publicSite/iconArrow.svg'

import { AUDIUS_ORG, AUDIUS_SIGN_UP_LINK, pushWindowRoute } from 'utils/links'

const messages = {
  title: 'UNLEASH YOUR MUSIC',
  subtitle1: 'Discover & Stream',
  subtitle2: 'Up-And-Coming Artists',
  subtitle: 'Discover & Stream Up-And-Coming Artists',
  cta: 'Sign Up Free',
  learn: 'Learn About The Token'
}

const onSignUp = () => {
  pushWindowRoute(AUDIUS_SIGN_UP_LINK)
}

const onLearnAboutToken = () => {
  pushWindowRoute(AUDIUS_ORG)
}

type HeroProps = {
  isMobile: boolean
  onImageLoad: () => void
} & { parallaxController: any }

export const Hero = (props: HeroProps) => {
  const { parallaxController, onImageLoad, isMobile } = props
  const onImgSet = useCallback(() => {
    if (!isMobile) parallaxController.update()
    onImageLoad()
  }, [parallaxController, onImageLoad, isMobile])

  if (props.isMobile) {
    return (
      <div className={styles.mobileContainer}>
        <div className={styles.content}>
          <div className={styles.parallaxBg}> </div>
          <Parallax className={cn(styles.mobileBG)} y={[0, -30]}>
            <img
              src={HeroBackgroundMobile}
              srcSet={`${HeroBackgroundMobile} 1500w, ${HeroBackground} 3000w`}
              sizes={'50vw'}
              className={styles.mobileImgBG}
              onLoad={onImgSet}
              alt='Playing Music'
            />
          </Parallax>
          <h1 className={styles.title}>{messages.title}</h1>
          <div className={styles.subtitle}>
            <div>{messages.subtitle1}</div>
            <div>{messages.subtitle2}</div>
          </div>
          <div onClick={onSignUp} className={styles.ctaButton}>
            <span className={styles.ctaMessage}>{messages.cta}</span>
            <IconArrow className={styles.ctaArrow} />
          </div>
          <div onClick={onLearnAboutToken} className={styles.tokenButton}>
            <span className={styles.ctaMessage}>{messages.learn}</span>
          </div>
        </div>
        <img src={GlyphPattern} alt='Pattern' className={styles.glyphPattern} />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.bg}>
        <div className={styles.parallaxBg}> </div>
        <Parallax
          className={cn(styles.background, styles.fgContainer)}
          y={[10, -30]}
        >
          <img
            srcSet={`${HeroForegroundMobile} 1500w, ${HeroForeground} 3000w`}
            sizes={'50vw'}
            src={HeroForeground}
            className={styles.foreground}
            onLoad={onImgSet}
            alt='Foreground DJ at event'
          />
        </Parallax>
        <Parallax className={styles.background} y={[10, -30]}>
          {/*
          // @ts-ignore */}
          <img
            srcSet={`${HeroBackgroundMobile} 1500w, ${HeroBackground} 3000w`}
            sizes={'(max-width: 1500px) 1500w, 3000w'}
            src={HeroBackground}
            onLoad={onImgSet}
            className={styles.foreground}
            alt='Background DJ at event'
          />
        </Parallax>
        <Parallax className={styles.textContent} y={['0px', '80px']}>
          <div className={styles.content}>
            <h1 className={styles.title}>{messages.title}</h1>
            <h2 className={styles.subtitle}>{messages.subtitle}</h2>
          </div>
        </Parallax>
        <Parallax className={styles.buttonContentParallax} y={['0px', '80px']}>
          <div className={styles.buttonContent}>
            <div onClick={onSignUp} className={styles.ctaButton}>
              <span className={styles.ctaMessage}>{messages.cta}</span>
              <IconArrow className={styles.ctaArrow} />
            </div>
            <div onClick={onLearnAboutToken} className={styles.tokenButton}>
              <span className={styles.ctaMessage}>{messages.learn}</span>
            </div>
          </div>
        </Parallax>
      </div>
      <img src={GlyphPattern} alt='Pattern' className={styles.glyphPattern} />
    </div>
  )
}

export default withController(Hero)
