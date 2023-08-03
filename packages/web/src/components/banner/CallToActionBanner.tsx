import { ReactNode } from 'react'

import { Client } from '@audius/common'
import { IconArrowWhite } from '@audius/stems'
import cn from 'classnames'

import { Banner, BannerProps } from 'components/banner/Banner'
import Pill from 'components/pill/Pill'
import { getClient } from 'utils/clientUtil'

import styles from './CallToActionBanner.module.css'

export type CallToActionBannerProps = Pick<
  BannerProps,
  'onClose' | 'className'
> & {
  onAccept: () => void
  emoji?: string
  pill?: string
  pillPosition?: 'left' | 'right'
  text: ReactNode
}

export const CallToActionBanner = (props: CallToActionBannerProps) => {
  const {
    emoji,
    pill,
    pillPosition = 'left',
    text,
    onAccept,
    ...bannerProps
  } = props

  const client = getClient()

  return (
    <Banner
      isElectron={client === Client.ELECTRON}
      isMobile={client === Client.MOBILE}
      {...bannerProps}
    >
      <div
        className={cn(styles.ctaBanner, {
          [styles.isMobile]: client === Client.MOBILE
        })}
        onClick={onAccept}
      >
        <div className={styles.content}>
          {pill && pillPosition === 'left' ? (
            <Pill
              className={styles.pill}
              textClassName={styles.pillText}
              showIcon={false}
              clickable={false}
              text={pill}
            />
          ) : null}
          <div className={styles.contentSelection}>
            {emoji ? <i className={cn('emoji', emoji)} /> : null}
            <div className={styles.text}>{text}</div>
            <IconArrowWhite className={styles.arrow} />
          </div>
          {pill && pillPosition === 'right' ? (
            <Pill
              className={styles.pill}
              textClassName={styles.pillText}
              showIcon={false}
              clickable={false}
              text={pill}
            />
          ) : null}
        </div>
      </div>
    </Banner>
  )
}
