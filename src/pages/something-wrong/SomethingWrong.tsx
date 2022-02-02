import React, { useCallback, useEffect } from 'react'

import { Button, ButtonType } from '@audius/stems'
import cn from 'classnames'
import { goBack, replace } from 'connected-react-router'
import { useDispatch } from 'react-redux'
import { useLastLocation } from 'react-router-last-location'

import tiledBackground from 'assets/img/notFoundTiledBackround.png'
import { Name } from 'common/models/Analytics'
import { ReloadMessage } from 'services/native-mobile-interface/linking'
import { track } from 'store/analytics/providers'
import { useIsMobile } from 'utils/clientUtil'
import { HOME_PAGE, ERROR_PAGE, SIGN_IN_PAGE, SIGN_UP_PAGE } from 'utils/route'
import { isDarkMode, isMatrix } from 'utils/theme/theme'

import styles from './SomethingWrong.module.css'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

const messages = {
  body1: 'We’re experiencing heavy load!',
  body2: 'Please try again later.',
  cta: 'Try Again'
}

const INVALID_BACK_PAGES = new Set([ERROR_PAGE, SIGN_IN_PAGE, SIGN_UP_PAGE])

export const SomethingWrong = () => {
  const lastLocation = useLastLocation()
  const isMobile = useIsMobile()
  const dispatch = useDispatch()

  useEffect(() => {
    track(Name.ERROR_PAGE)
  }, [])

  const lastRoutePathname = lastLocation?.pathname
  const shouldGoToHomePage =
    !lastRoutePathname || INVALID_BACK_PAGES.has(lastRoutePathname)

  const handleClickRetry = useCallback(() => {
    if (NATIVE_MOBILE) {
      new ReloadMessage().send()
    } else if (shouldGoToHomePage) {
      dispatch(replace(HOME_PAGE))
    } else {
      dispatch(goBack())
    }
  }, [shouldGoToHomePage, dispatch])

  return (
    <div
      className={cn(styles.somethingWrong, {
        [styles.isMobile]: isMobile
      })}
    >
      <div
        className={styles.content}
        style={{
          backgroundImage: `url(${tiledBackground})`,
          backgroundBlendMode:
            isDarkMode() || isMatrix() ? 'color-burn' : 'none'
        }}
      >
        <div className={styles.body}>
          <div>{messages.body1}</div>
          <div>
            {messages.body2} <i className='emoji xl heavy-black-heart' />
          </div>
        </div>
        <div className={styles.cta}>
          <Button
            className={styles.buttonFormatting}
            textClassName={styles.buttonText}
            type={ButtonType.PRIMARY_ALT}
            text={messages.cta}
            onClick={handleClickRetry}
          />
        </div>
      </div>
    </div>
  )
}

export default SomethingWrong
