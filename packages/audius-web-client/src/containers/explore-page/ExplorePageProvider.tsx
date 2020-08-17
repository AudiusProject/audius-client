import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { push as pushRoute } from 'connected-react-router'

import { AppState } from 'store/types'
import { Dispatch } from 'redux'
import { getAccountUser } from 'store/account/selectors'
import { fetchExplore } from './store/actions'
import { makeGetExplore } from './store/selectors'
import { formatCount } from 'utils/formatUtil'

import { ExplorePageProps as MobileExplorePageProps } from './components/mobile/ExplorePage'
import { ExplorePageProps as DesktopExplorePageProps } from './components/desktop/ExplorePage'

const messages = {
  title: 'Explore',
  description: 'Explore featured content on Audius'
}

type OwnProps = {
  children:
    | React.ComponentType<MobileExplorePageProps>
    | React.ComponentType<DesktopExplorePageProps>
}

type ExplorePageProps = OwnProps &
  ReturnType<ReturnType<typeof makeMapStateToProps>> &
  ReturnType<typeof mapDispatchToProps> &
  RouteComponentProps

const ExplorePage = ({
  account,
  explore,
  fetchExplore,
  goToRoute,
  children: Children
}: ExplorePageProps) => {
  useEffect(() => {
    fetchExplore()
  }, [fetchExplore])

  const formatPlaylistCardSecondaryText = (saves: number, tracks: number) => {
    const savesText = saves === 1 ? 'Favorite' : 'Favorites'
    const tracksText = tracks === 1 ? 'Track' : 'Tracks'
    return `${formatCount(saves)} ${savesText} • ${tracks} ${tracksText}`
  }

  const formatProfileCardSecondaryText = (followers: number) => {
    const followersText = followers === 1 ? 'Follower' : 'Followers'
    return `${formatCount(followers)} ${followersText}`
  }

  const childProps = {
    title: messages.title,
    description: messages.description,
    // Props from AppState
    account,
    playlists: explore.playlists,
    profiles: explore.profiles,
    status: explore.status,
    formatPlaylistCardSecondaryText,
    formatProfileCardSecondaryText,

    // Props from dispatch
    goToRoute
  }

  const mobileProps = {}

  const desktopProps = {}

  return <Children {...childProps} {...mobileProps} {...desktopProps} />
}

function makeMapStateToProps() {
  const getExplore = makeGetExplore()
  const mapStateToProps = (state: AppState) => {
    return {
      account: getAccountUser(state),
      explore: getExplore(state, {})
    }
  }
  return mapStateToProps
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    fetchExplore: () => dispatch(fetchExplore()),
    goToRoute: (route: string) => dispatch(pushRoute(route))
  }
}

export default withRouter(
  connect(makeMapStateToProps, mapDispatchToProps)(ExplorePage)
)
