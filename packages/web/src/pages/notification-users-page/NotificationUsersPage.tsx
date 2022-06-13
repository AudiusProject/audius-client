import { useContext, useEffect } from 'react'

import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Dispatch } from 'redux'

import { loadMore } from 'common/store/user-list/actions'
import {
  getPageTitle,
  getUserList
} from 'common/store/user-list/notifications/selectors'
import { USER_LIST_TAG } from 'common/store/user-list/notifications/types'
import MobilePageContainer from 'components/mobile-page-container/MobilePageContainer'
import NavContext, { LeftPreset } from 'components/nav/store/context'
import UserList from 'components/user-list/UserList'
import { AppState } from 'store/types'

export type OwnProps = {}

type NotificationUsersPageProps = OwnProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  RouteComponentProps<{ notificationId: string }>

const NotificationUsersPage = ({ pageTitle }: NotificationUsersPageProps) => {
  // Set the Nav Header
  const { setLeft, setCenter, setRight } = useContext(NavContext)!
  useEffect(() => {
    setLeft(LeftPreset.BACK)
    setCenter(pageTitle)
    setRight(null)
  }, [setLeft, setCenter, setRight, pageTitle])

  return (
    <MobilePageContainer fullHeight>
      <UserList stateSelector={getUserList} tag={USER_LIST_TAG} />
    </MobilePageContainer>
  )
}

function mapStateToProps(state: AppState) {
  return {
    pageTitle: getPageTitle(state)
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    loadMore: () => dispatch(loadMore(USER_LIST_TAG))
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(NotificationUsersPage)
)
