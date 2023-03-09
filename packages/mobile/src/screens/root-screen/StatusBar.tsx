import { useEffect } from 'react'

import { accountSelectors, Status } from '@audius/common'
import { StatusBar as StatussBar } from 'react-native'
import { NavigationBar, StatusBar as RNStatusBar } from 'react-native-bars'
import { useSelector } from 'react-redux'

import { Theme, useThemeVariant } from 'app/utils/theme'

const { getAccountStatus } = accountSelectors

type ThemedStatusBarProps = {
  isAppLoaded: boolean
  isSplashScreenDismissed: boolean
}

export const StatusBar = (props: ThemedStatusBarProps) => {
  const { isAppLoaded, isSplashScreenDismissed } = props
  const theme = useThemeVariant()
  const accountStatus = useSelector(getAccountStatus)

  const onSignUpScreen = isAppLoaded && !(accountStatus === Status.SUCCESS)
  // Status & nav bar content (the buttons) should be light while in a dark theme or
  // the splash screen is still visible (it's purple and white-on-purple looks better)
  const statusBarStyle =
    theme === Theme.DARK || theme === Theme.MATRIX
      ? 'light-content'
      : 'dark-content'
  const navBarStyle =
    theme === Theme.DARK || theme === Theme.MATRIX || onSignUpScreen
      ? 'light-content'
      : 'dark-content'

  useEffect(() => {
    StatussBar.setBarStyle('light-content')
  }, [statusBarStyle])

  // Wait until splash screen in dismissed before rendering statusbar
  // if (!isSplashScreenDismissed) return null
  return null

  // return (
  //   <>
  //     <RNStatusBar barStyle={statusBarStyle} />
  //     <NavigationBar barStyle={navBarStyle} />
  //   </>
  // )
}
