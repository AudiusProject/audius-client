import { call, put, select, takeLatest } from 'typed-redux-saga'

import { getContext } from '../../effects'
import { setVisibility } from '../modals/slice'

import { getDiscordCode } from './selectors'
import { pressDiscord, setDiscordCode } from './slice'

const getSignableData = () => {
  const vals = 'abcdefghijklmnopqrstuvwxyz123456789'
  return vals.charAt(Math.floor(Math.random() * vals.length))
}

function* fetchDiscordCode() {
  const discordCode = yield* select(getDiscordCode)
  if (!discordCode) {
    const audiusBackendInstance = yield* getContext('audiusBackendInstance')
    yield* call(audiusBackendInstance.waitForWeb3)
    const data = getSignableData()
    const signature = yield* call(audiusBackendInstance.getSignature, data)
    const appended = `${signature}:${data}`
    yield* put(setDiscordCode({ code: appended }))
  }

  yield* put(setVisibility({ modal: 'VipDiscord', visible: true }))
}

function* watchPressDiscord() {
  yield* takeLatest(pressDiscord.type, fetchDiscordCode)
}

export default function sagas() {
  return [watchPressDiscord]
}
