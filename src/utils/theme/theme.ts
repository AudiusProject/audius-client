import Theme from 'models/Theme'

import DarkTheme from './dark'
import DefaultTheme from './default'
import { getIsIOS } from 'utils/browser'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

const THEME_KEY = 'theme'
export const PREFERS_DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'

const applyTheme = (themeObject: { [key: string]: string }) => {
  Object.keys(themeObject).forEach(key => {
    document.documentElement.style.setProperty(key, themeObject[key])
  })
}

const doesPreferDarkMode = () => {
  if (NATIVE_MOBILE && !getIsIOS()) {
    // @ts-ignore
    return window.prefersDarkMode
  }
  return (
    window.matchMedia && window.matchMedia(PREFERS_DARK_MEDIA_QUERY).matches
  )
}

export const shouldShowDark = (theme?: Theme | null) => {
  return (
    !!theme &&
    (theme === Theme.DARK || (theme === Theme.AUTO && doesPreferDarkMode()))
  )
}

export const setTheme = (theme: Theme) => {
  switch (theme) {
    case Theme.DARK:
      applyTheme(DarkTheme)
      break
    case Theme.AUTO:
      if (doesPreferDarkMode()) {
        applyTheme(DarkTheme)
      } else {
        applyTheme(DefaultTheme)
      }
      break
    default:
      applyTheme(DefaultTheme)
      break
  }
  window.localStorage.setItem(THEME_KEY, theme)
}

export const getTheme = (): Theme | null => {
  const theme = window.localStorage.getItem(THEME_KEY)
  if (theme && Object.values(Theme).includes(theme as Theme)) {
    return theme as Theme
  }
  return null
}

export const isDarkMode = () => shouldShowDark(getTheme())

export const clearTheme = () => {
  window.localStorage.removeItem(THEME_KEY)
}
