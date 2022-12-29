import type { Theme } from '@audius/common'
import { themeSelectors, themeActions } from '@audius/common'
import type { PayloadAction } from '@reduxjs/toolkit'
import { takeEvery, select, call } from 'typed-redux-saga'

import { THEME_STORAGE_KEY } from 'app/constants/storage-keys'
import { localStorage } from 'app/services/local-storage'
import { updateStatusBarTheme } from 'app/utils/theme'
const { setTheme } = themeActions
const { getSystemAppearance } = themeSelectors

function* setThemeAsync(action: PayloadAction<{ theme: Theme }>) {
  const systemAppearance = yield* select(getSystemAppearance)
  const { theme } = action.payload
  updateStatusBarTheme(theme, systemAppearance)

  yield* call([localStorage, 'setItem'], THEME_STORAGE_KEY, theme)
}

function* watchSetTheme() {
  yield* takeEvery(setTheme, setThemeAsync)
}

export default function sagas() {
  return [watchSetTheme]
}
