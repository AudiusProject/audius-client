import { take, takeEvery, select, put } from 'redux-saga/effects'
import {
  LOCATION_CHANGE,
  push as pushRoute,
  goBack
} from 'connected-react-router'
import mobileSagas from './mobileSagas'
import {
  OnFirstPage,
  NotOnFirstPage
} from 'services/native-mobile-interface/lifecycle'
import { MessageType } from 'services/native-mobile-interface/types'
import {
  SIGN_IN_PAGE,
  SIGN_UP_PAGE,
  FEED_PAGE,
  TRENDING_PAGE,
  EXPLORE_PAGE,
  FAVORITES_PAGE,
  profilePage
} from 'utils/route'
import { getLocationPathname } from './selectors'
import { getUserHandle } from 'store/account/selectors'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE
enum LocationAction {
  PUSH = 'PUSH',
  POP = 'POP',
  REPLACE = 'REPLACE'
}

;(window as any).locationHistory = []

function* trackLocation() {
  while (true) {
    const {
      payload: { location, action, isFirstRendering }
    } = yield take(LOCATION_CHANGE)
    if (isFirstRendering) {
      ;(window as any).locationHistory.push(location)
    } else if (action === LocationAction.POP) {
      ;(window as any).locationHistory.pop()
    } else if (action === LocationAction.REPLACE) {
      const lastIndex = (window as any).locationHistory.length - 1
      ;(window as any).locationHistory[lastIndex] = location
    } else if (action === LocationAction.PUSH) {
      ;(window as any).locationHistory.push(location)
    }

    const historyLength = (window as any).locationHistory.length
    const firstPageRoutes = [SIGN_IN_PAGE, SIGN_UP_PAGE, FEED_PAGE]
    if (firstPageRoutes.includes(location.pathname) && !location.search) {
      // If native mobile, the sign in / sign up page should not offer a back btn option
      const message = new OnFirstPage()
      message.send()
    } else if (historyLength <= 1) {
      const message = new OnFirstPage()
      message.send()
    } else {
      const message = new NotOnFirstPage()
      message.send()
    }
  }
}

function* handleHardwareBack() {
  yield takeEvery(MessageType.GO_BACK, function* () {
    const pathname = yield select(getLocationPathname)
    const homeRoute = FEED_PAGE
    // Bottom Bar routes excluding the home route
    const bottomBarRoutes = [TRENDING_PAGE, EXPLORE_PAGE, FAVORITES_PAGE]
    const handle = yield select(getUserHandle)
    if (handle) bottomBarRoutes.push(profilePage(handle))
    if (pathname === homeRoute) {
    } else if (bottomBarRoutes.includes(pathname)) {
      yield put(pushRoute(homeRoute))
      const message = new OnFirstPage()
      message.send()
    } else {
      yield put(goBack())
    }
  })
}

const sagas = () => {
  const sagas: Array<() => void> = [trackLocation, handleHardwareBack]
  return NATIVE_MOBILE ? sagas.concat(mobileSagas()) : sagas
}

export default sagas
