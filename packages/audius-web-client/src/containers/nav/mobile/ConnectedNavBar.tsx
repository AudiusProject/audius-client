import React, { useCallback, useContext } from 'react'
import { AppState, Status } from 'store/types'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { push as pushRoute, goBack } from 'connected-react-router'
import { TRENDING_PAGE, NOTIFICATION_PAGE, SETTINGS_PAGE } from 'utils/route'
import { openSignOn } from 'containers/sign-on/store/actions'
import { getAccountUser, getAccountStatus } from 'store/account/selectors'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import NavBar from './NavBar'
import { getSearchStatus } from 'containers/search-page/store/selectors'
import { getNotificationUnreadCount } from 'containers/notification/store/selectors'
import {
  RouterContext,
  SlideDirection
} from 'containers/animated-switch/RouterContextProvider'
import { getIsIOS } from 'utils/browser'
import { make, useRecord } from 'store/analytics/actions'
import { Name } from 'services/analytics'

type ConnectedNavBarProps = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  RouteComponentProps<any>

const ConnectedNavBar = ({
  goToRoute,
  account,
  accountStatus,
  openSignOn,
  history,
  searchStatus,
  notificationCount,
  goBack
}: ConnectedNavBarProps) => {
  const { setStackReset, setSlideDirection } = useContext(RouterContext)

  const search = (query: string) => {
    history.push({
      pathname: `/search/${query}`,
      state: {}
    })
  }

  const goToTrending = useCallback(() => {
    goToRoute(TRENDING_PAGE)
  }, [goToRoute])

  const record = useRecord()
  const goToNotificationPage = useCallback(() => {
    if (getIsIOS()) {
      setSlideDirection(SlideDirection.FROM_RIGHT)
    } else {
      setStackReset(true)
    }
    setImmediate(() => goToRoute(NOTIFICATION_PAGE))
    record(make(Name.NOTIFICATIONS_OPEN, { source: 'button' }))
  }, [goToRoute, setStackReset, setSlideDirection, record])

  const goToSettingsPage = useCallback(() => {
    setStackReset(true)
    setImmediate(() => goToRoute(SETTINGS_PAGE))
  }, [goToRoute, setStackReset])

  const signUp = useCallback(() => {
    setStackReset(true)
    setImmediate(() => openSignOn(false))
  }, [openSignOn, setStackReset])

  return (
    <NavBar
      isSignedIn={!!account}
      isLoading={accountStatus === Status.LOADING}
      signUp={signUp}
      notificationCount={notificationCount}
      goToNotificationPage={goToNotificationPage}
      goToSettingsPage={goToSettingsPage}
      search={search}
      logoClicked={goToTrending}
      searchStatus={searchStatus}
      goBack={goBack}
      history={history}
    />
  )
}

function mapStateToProps(state: AppState) {
  return {
    account: getAccountUser(state),
    accountStatus: getAccountStatus(state),
    searchStatus: getSearchStatus(state),
    notificationCount: getNotificationUnreadCount(state)
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    openSignOn: (signIn: boolean) => dispatch(openSignOn(signIn)),
    goToRoute: (route: string) => dispatch(pushRoute(route)),
    goBack: () => dispatch(goBack())
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ConnectedNavBar)
)
