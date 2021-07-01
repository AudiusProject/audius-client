import React from 'react'

import cn from 'classnames'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { ReactComponent as IconRemove } from 'assets/img/iconRemove.svg'
import { dismissCookieBanner } from 'store/application/ui/cookieBanner/actions'
import { getUid } from 'store/player/selectors'
import { AppState } from 'store/types'
import { isMobile } from 'utils/clientUtil'
import { COOKIE_POLICY } from 'utils/route'

import styles from './CookieBanner.module.css'

const messages = {
  description:
    'We use cookies to make Audius work and to improve your experience. By using this site you agree to our',
  link: 'Privacy Policy.'
}

export type CookieBannerProps = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

export const CookieBanner = ({
  isMobile,
  isPlaying,
  dismiss
}: CookieBannerProps) => {
  const goToCookiePolicy = () => {
    const win = window.open(COOKIE_POLICY, '_blank')
    if (win) win.focus()
  }

  return (
    <div
      className={cn(styles.container, {
        [styles.isMobile]: isMobile,
        [styles.isPlaying]: isPlaying
      })}
    >
      <div className={styles.description}>
        {messages.description}
        <span className={styles.link} onClick={goToCookiePolicy}>
          {messages.link}
        </span>
      </div>
      <div className={styles.iconContainer} onClick={dismiss}>
        <IconRemove className={styles.iconRemove} />
      </div>
    </div>
  )
}

function mapStateToProps(state: AppState) {
  return {
    isMobile: isMobile(),
    isPlaying: !!getUid(state)
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    dismiss: () => dispatch(dismissCookieBanner())
  }
}

export default React.memo(
  connect(mapStateToProps, mapDispatchToProps)(CookieBanner)
)
