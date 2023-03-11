import { themeSelectors, themeActions } from '@audius/common'

import { THEME_STORAGE_KEY } from 'app/constants/storage-keys'
import { localStorage } from 'app/services/local-storage'
import { updateStatusBarTheme } from 'app/utils/theme'

import type { AppStartListening } from '../listenerMiddleware'
const { setTheme, setSystemAppearance } = themeActions
const { getSystemAppearance, getTheme } = themeSelectors

export const addListeners = (startListening: AppStartListening) => {
  startListening({
    actionCreator: setTheme,
    effect: async function setThemeEffect(action, listenerApi) {
      const systemAppearance = getSystemAppearance(listenerApi.getState())
      const { theme } = action.payload
      updateStatusBarTheme(theme, systemAppearance)

      await localStorage.setItem(THEME_STORAGE_KEY, theme)
    }
  })

  startListening({
    actionCreator: setSystemAppearance,
    effect: async function setSystemAppearanceEffect(action, listenerApi) {
      const { systemAppearance } = action.payload
      const theme = getTheme(listenerApi.getState())
      updateStatusBarTheme(theme, systemAppearance)
    }
  })
}
