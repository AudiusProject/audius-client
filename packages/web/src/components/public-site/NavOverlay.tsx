import { useState, useEffect } from 'react'

import {
  IconRemove,
  IconInstagram,
  IconTwitterBird,
  IconDiscord,
  IconExplore,
  IconTrending,
  IconCampFire,
  IconDownload,
  IconFollow
} from '@audius/stems'
import cn from 'classnames'
import ReactDOM from 'react-dom'

import HeroBackground from 'assets/img/publicSite/Hero-BG@2x.png'
import HorizontalLogo from 'assets/img/publicSite/Horizontal-Logo-Full-Color@2x.png'
import {
  AUDIUS_TWITTER_LINK,
  AUDIUS_INSTAMGRAM_LINK,
  AUDIUS_DISCORD_LINK,
  AUDIUS_TEAM_LINK,
  AUDIUS_LISTENING_LINK,
  AUDIUS_PRESS_LINK,
  PRIVACY_POLICY,
  TERMS_OF_SERVICE,
  AUDIUS_HOT_AND_NEW,
  AUDIUS_EXPLORE_LINK,
  AUDIUS_DOCS_LINK,
  AUDIUS_BLOG_LINK,
  AUDIUS_REMIX_CONTESTS_LINK,
  AUDIUS_ORG
} from 'utils/route'

import styles from './NavOverlay.module.css'
import { handleClickRoute } from './handleClickRoute'

const messages = {
  startListening: 'Start Listening'
}

const socialLinks = [
  {
    Icon: IconInstagram,
    link: AUDIUS_INSTAMGRAM_LINK
  },
  {
    Icon: IconTwitterBird,
    link: AUDIUS_TWITTER_LINK
  },
  {
    Icon: IconDiscord,
    link: AUDIUS_DISCORD_LINK
  }
]

const dappLinks = [
  {
    text: 'Sign Up',
    icon: <IconFollow className={styles.dappLinkIcon} />,
    link: AUDIUS_EXPLORE_LINK
  },
  {
    text: 'Trending',
    icon: <IconTrending className={styles.dappLinkIcon} />,
    link: AUDIUS_LISTENING_LINK
  },
  {
    text: 'Explore',
    icon: <IconExplore className={styles.dappLinkIcon} />,
    link: AUDIUS_EXPLORE_LINK
  },
  {
    text: 'Hot & New',
    icon: <IconCampFire className={styles.dappLinkIcon} />,
    link: AUDIUS_EXPLORE_LINK
  },
  {
    text: 'Download App',
    icon: <IconDownload className={styles.dappLinkIcon} />,
    link: AUDIUS_HOT_AND_NEW
  }
]

const links = [
  {
    text: 'Blog',
    link: AUDIUS_BLOG_LINK
  },
  {
    text: 'Docs',
    link: AUDIUS_DOCS_LINK
  },
  {
    text: 'Privacy Policy',
    link: PRIVACY_POLICY
  },
  {
    text: 'Remixes',
    link: AUDIUS_REMIX_CONTESTS_LINK
  },
  {
    text: 'Team',
    link: AUDIUS_TEAM_LINK
  },
  {
    text: 'Terms of Service',
    link: TERMS_OF_SERVICE
  },
  {
    text: 'Token',
    link: AUDIUS_ORG
  },
  {
    text: 'Brand',
    link: AUDIUS_PRESS_LINK
  }
]

type NavOverlayProps = {
  isOpen: boolean
  closeNavScreen: () => void
  setRenderPublicSite: (shouldRender: boolean) => void
}

const rootId = 'navOverlay'

const useModalRoot = () => {
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    let el = document.getElementById(rootId)
    if (el) {
      setModalRoot(el)
    } else {
      el = document.createElement('div')
      el.id = rootId
      document.body.appendChild(el)
      setModalRoot(el)
    }
  }, [])

  return modalRoot
}

const NavOverlay = (props: NavOverlayProps) => {
  const onStartListening = () => {
    props.closeNavScreen()
    handleClickRoute(AUDIUS_LISTENING_LINK, props.setRenderPublicSite)()
  }

  const modalRoot = useModalRoot()

  return (
    modalRoot &&
    ReactDOM.createPortal(
      <div
        className={cn(styles.container, {
          [styles.hide]: !props.isOpen
        })}
      >
        <div
          className={cn(styles.backgroundContainer)}
          style={{
            backgroundImage: `url(${HeroBackground})`
          }}
        >
          <div className={cn(styles.background)}></div>
        </div>
        <div className={styles.content}>
          <div className={styles.iconContainer}>
            <IconRemove
              className={styles.iconClose}
              onClick={props.closeNavScreen}
            />
            <img
              src={HorizontalLogo}
              className={styles.horizontalLogo}
              alt='Audius Logo'
            />
          </div>
          <div className={styles.dappLinksContainer}>
            <div className={styles.dappLinks}>
              {dappLinks.map(({ icon, text, link }, idx) => (
                <a
                  key={idx}
                  onClick={handleClickRoute(link, props.setRenderPublicSite)}
                  className={styles.dappLink}
                  href={link}
                >
                  {icon}
                  <h4 className={styles.dappLinkText}>{text}</h4>
                </a>
              ))}
            </div>
          </div>
          <div className={styles.startListeningButtonContainer}>
            <button
              className={styles.startListeningButton}
              onClick={onStartListening}
            >
              {messages.startListening}
            </button>
          </div>
          <div className={styles.iconsContainer}>
            {socialLinks.map(({ Icon, link }, idx) => (
              <a
                key={idx}
                href={link}
                onClick={handleClickRoute(link, props.setRenderPublicSite)}
              >
                <Icon className={styles.icon} />
              </a>
            ))}
          </div>
          <div className={styles.linksContainer}>
            {links.map(({ text, link }, idx) => (
              <a
                key={idx}
                onClick={handleClickRoute(link, props.setRenderPublicSite)}
                className={styles.link}
                href={link}
              >
                {text}
              </a>
            ))}
          </div>
        </div>
      </div>,
      modalRoot
    )
  )
}

export default NavOverlay
