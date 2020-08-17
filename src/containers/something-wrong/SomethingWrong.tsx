import React, { useCallback, useEffect } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import cn from 'classnames'
import { Button, ButtonType } from '@audius/stems'

import tiledBackground from 'assets/img/notFoundTiledBackround.png'
import { AppState } from 'store/types'

import styles from './SomethingWrong.module.css'
import { HOME_PAGE, ERROR_PAGE, SIGN_IN_PAGE, SIGN_UP_PAGE } from 'utils/route'
import { getTheme } from 'store/application/ui/theme/selectors'
import Theme from 'models/Theme'
import { shouldShowDark } from 'utils/theme/theme'
import { useIsMobile } from 'utils/clientUtil'
import { ReloadMessage } from 'services/native-mobile-interface/linking'
import { track } from 'store/analytics/providers/segment'
import { Name } from 'services/analytics'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

const messages = {
  title: 'Whoops... 😱',
  subtitle: 'Something has gone wrong',
  body: 'Please try refreshing, or check back later.',
  cta: 'Take Me Back'
}

type OwnProps = {
  lastRoute: string
}

type SomethingWrongProps = OwnProps &
  Omit<ReturnType<typeof mapStateToProps>, 'theme'> &
  ReturnType<typeof mapDispatchToProps> & { theme?: Theme | null } // a store. // The something wrong component can be rendered without

const INVALID_BACK_PAGES = new Set([ERROR_PAGE, SIGN_IN_PAGE, SIGN_UP_PAGE])

export const SomethingWrong = ({
  lastRoute,
  goBack,
  theme
}: SomethingWrongProps) => {
  const isMobile = useIsMobile()

  useEffect(() => {
    track(Name.ERROR_PAGE)
  }, [])

  const onClickTakeMeBack = useCallback(() => {
    if (NATIVE_MOBILE) {
      new ReloadMessage().send()
    } else {
      const backRoute =
        lastRoute && !INVALID_BACK_PAGES.has(lastRoute) ? lastRoute : HOME_PAGE
      goBack(backRoute)
    }
  }, [lastRoute, goBack])

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
          backgroundBlendMode: shouldShowDark(theme) ? 'color-burn' : 'none'
        }}
      >
        <div className={styles.title}>{messages.title}</div>
        <div className={styles.subtitle}>{messages.subtitle}</div>
        <div className={styles.body}>
          <Button
            className={styles.buttonFormatting}
            textClassName={styles.buttonText}
            type={ButtonType.PRIMARY_ALT}
            text={messages.cta}
            onClick={onClickTakeMeBack}
          />
        </div>
      </div>
    </div>
  )
}

function mapStateToProps(state: AppState) {
  return {
    theme: getTheme(state)
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    goBack: (backRoute: string) => {
      window.location.href = backRoute
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SomethingWrong)
