import React, { useState, useEffect, useCallback } from 'react'
import cn from 'classnames'

import HorizontalLogo from 'assets/img/publicSite/Horizontal-Logo-Full-Color.png'
import {
  IconExplore,
  IconTrending,
  IconCampFire,
  IconKebabHorizontal
} from '@audius/stems'
import {
  pushWindowRoute,
  handleClickRoute,
  AUDIUS_HOME_LINK,
  AUDIUS_DEV_STAKER_LINK,
  AUDIUS_LISTENING_LINK,
  AUDIUS_HOT_AND_NEW,
  AUDIUS_EXPLORE_LINK
} from 'utils/links'

import styles from './NavBanner.module.css'

const messages = {
  explore: 'Explore',
  trending: 'Trending',
  hotAndNew: 'Hot & New',
  devStakers: 'Devs & Stakers',
  startListening: 'Start Listening'
}

const onClickHome = handleClickRoute(AUDIUS_HOME_LINK)
const onClickExplore = handleClickRoute(AUDIUS_EXPLORE_LINK)
const onClickTrending = handleClickRoute(AUDIUS_LISTENING_LINK)
const onClickHotAndNew = handleClickRoute(AUDIUS_HOT_AND_NEW)
const onClickDevStakers = handleClickRoute(AUDIUS_DEV_STAKER_LINK)

type NavBannerProps = {
  isMobile: boolean
  invertColors?: boolean
  className?: string
  openNavScreen: () => void
  setRenderPublicSite: (shouldRender: boolean) => void
}

const NavBanner = (props: NavBannerProps) => {
  const [isScrolling, setIsScrolling] = useState(false)
  const setScrolling = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const isScrolling = scrollTop > 20
    setIsScrolling(isScrolling)
  }, [])

  const onStartListening = () => {
    props.setRenderPublicSite(false)
    if (window.location.pathname === AUDIUS_HOME_LINK) {
      window.history.pushState('', '/', AUDIUS_LISTENING_LINK)
    } else {
      pushWindowRoute(AUDIUS_LISTENING_LINK)
    }
  }

  useEffect(() => {
    setScrolling()
    window.addEventListener('scroll', setScrolling)
    return () => window.removeEventListener('scroll', setScrolling)
  }, [setScrolling])

  if (props.isMobile) {
    return (
      <div
        className={cn(styles.mobileContainer, {
          [props.className!]: !!props.className,
          [styles.invertColors]: isScrolling || props.invertColors
        })}
      >
        <IconKebabHorizontal
          className={styles.kebabMenu}
          onClick={props.openNavScreen}
        />
        <div className={styles.centerLogo}>
          <img
            src={HorizontalLogo}
            className={styles.horizontalLogo}
            alt='Audius Logo'
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(styles.container, {
        [props.className!]: !!props.className,
        [styles.invertColors]: isScrolling || props.invertColors
      })}
    >
      <div className={styles.contentContainer}>
        <div className={styles.iconContainer}>
          <a
            className={styles.iconLink}
            onClick={onClickExplore}
            href={AUDIUS_EXPLORE_LINK}
          >
            <IconExplore className={styles.linkIcon} />
            <h3 className={styles.iconLinkText}>{messages.explore}</h3>
          </a>
          <a
            className={styles.iconLink}
            onClick={onClickTrending}
            href={AUDIUS_LISTENING_LINK}
          >
            <IconTrending className={styles.linkIcon} />
            <h3 className={styles.iconLinkText}>{messages.trending}</h3>
          </a>
          <a
            className={styles.iconLink}
            onClick={onClickHotAndNew}
            href={AUDIUS_HOT_AND_NEW}
          >
            <IconCampFire className={styles.linkIcon} />
            <h3 className={styles.iconLinkText}>{messages.hotAndNew}</h3>
          </a>
        </div>
        <div className={styles.centerLogo}>
          <img
            alt='Audius Logo'
            src={HorizontalLogo}
            className={styles.horizontalLogo}
            onClick={onClickHome}
          />
        </div>
        <div className={styles.linkContainer}>
          <div onClick={onClickDevStakers} className={styles.devStakers}>
            {messages.devStakers}
          </div>
          <div onClick={onStartListening} className={styles.startListening}>
            {messages.startListening}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NavBanner
