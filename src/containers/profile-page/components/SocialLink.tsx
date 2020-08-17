import React, { ReactNode, useCallback } from 'react'
import cn from 'classnames'
import Linkify from 'linkifyjs/react'
import {
  IconTwitterBird,
  IconInstagram,
  IconDonate,
  IconLink
} from '@audius/stems'

import styles from './SocialLink.module.css'
import Tooltip from 'components/tooltip/Tooltip'

export enum Type {
  TWITTER,
  INSTAGRAM,
  WEBSITE,
  DONATION
}

const SITE_URL_MAP = {
  [Type.TWITTER]: 'https://twitter.com/',
  [Type.INSTAGRAM]: 'https://instagram.com/'
}

const goToHandle = (type: Type.TWITTER | Type.INSTAGRAM, handle: string) => {
  if (SITE_URL_MAP[type] && handle) {
    const win = window.open(`${SITE_URL_MAP[type]}${handle}`, '_blank')
    if (win) win.focus()
  }
}

const goToLink = (link: string) => {
  if (!/^https?/.test(link)) {
    link = `http://${link}`
  }
  const win = window.open(link, '_blank')
  if (win) win.focus()
}

type SocialLinkProps = {
  type: Type
  link: string
  onClick: () => void
}

const SocialLink = ({ type, link, onClick }: SocialLinkProps) => {
  const onIconClick = useCallback(() => {
    if (type === Type.TWITTER || type === Type.INSTAGRAM) {
      goToHandle(type, link)
    } else {
      goToLink(link)
    }
    if (onClick) onClick()
  }, [type, link, onClick])

  let icon: ReactNode
  switch (type) {
    case Type.TWITTER:
      icon = <IconTwitterBird className={styles.icon} />
      break
    case Type.INSTAGRAM:
      icon = <IconInstagram className={styles.icon} />
      break
    case Type.WEBSITE:
      icon = <IconLink className={styles.icon} />
      break
    case Type.DONATION:
      icon = (
        <Tooltip text='Donate'>
          <IconDonate className={styles.icon} />
        </Tooltip>
      )
      break
  }

  let text: ReactNode
  if (type === Type.TWITTER || type === Type.INSTAGRAM) {
    text = `@${link}`
  } else {
    text = link.replace(/((?:https?):\/\/)|www./g, '')
    if (type === Type.DONATION) {
      text = (
        <Linkify
          // https://github.com/Soapbox/linkifyjs/issues/292
          // @ts-ignore
          options={{ attributes: { onClick: onClick } }}
        >
          {text}
        </Linkify>
      )
    }
  }
  const singleLink =
    type === Type.TWITTER || type === Type.INSTAGRAM || type === Type.WEBSITE

  return (
    <div className={styles.socialLink}>
      <div
        onClick={singleLink ? onIconClick : () => {}}
        className={cn(styles.wrapper, {
          [styles.singleLink]: singleLink
        })}
      >
        {icon}
        <div className={styles.text}>{text}</div>
      </div>
    </div>
  )
}

export default SocialLink
