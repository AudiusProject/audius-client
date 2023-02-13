import type { TypedStartListening } from '@reduxjs/toolkit'
import { createListenerMiddleware } from '@reduxjs/toolkit'

import type { AppState } from './store'
import { addListeners as addThemeListeners } from './theme/listeners'

export const listenerMiddleware = createListenerMiddleware()

export type AppStartListening = TypedStartListening<AppState>

const startListening = listenerMiddleware.startListening as AppStartListening

addThemeListeners(startListening)
