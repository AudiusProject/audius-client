import { createContext, ReactNode, useState } from 'react'

import { useDarkMode } from 'react-native-dark-mode'

import { Theme } from 'app/utils/theme'

type ThemeContextProps = {
  theme: Theme
  setTheme: (theme: Theme) => void
  isSystemDarkMode: boolean
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: Theme.DEFAULT,
  setTheme: () => {},
  isSystemDarkMode: false
})

type ThemeProviderProps = {
  children: ReactNode
}

export const ThemeProvider = (props: ThemeProviderProps) => {
  const { children } = props
  const [theme, setTheme] = useState<Theme>(Theme.DEFAULT)
  const isSystemDarkMode = useDarkMode()

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        isSystemDarkMode
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
