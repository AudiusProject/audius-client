import React, { useEffect, useState, useCallback } from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { matchPath } from 'react-router'
import { push as pushRoute } from 'connected-react-router'

import { AppState } from 'store/types'
import { CollectionsPageProps as MobileCollectionsPageProps } from './components/mobile/CollectionsPage'
import { CollectionsPageProps as DesktopCollectionsPageProps } from './components/desktop/CollectionsPage'
import { ExploreCollectionsVariant } from './store/types'
import { getCollections, getStatus } from './store/collections/selectors'
import { fetch } from './store/collections/slice'
import { useLocation } from 'react-router-dom'
import {
  EXPLORE_MOOD_PLAYLISTS_PAGE,
  REPOSTING_USERS_ROUTE,
  FAVORITING_USERS_ROUTE
} from 'utils/route'
import {
  EXPLORE_COLLECTIONS_MAP,
  ExploreCollection,
  ExploreMoodCollection,
  EXPLORE_MOOD_COLLECTIONS_MAP
} from './collections'
import { ID } from 'models/common/Identifiers'
import { setRepost } from 'containers/reposts-page/store/actions'
import { RepostType } from 'containers/reposts-page/store/types'
import { setFavorite } from 'containers/favorites-page/store/actions'
import { FavoriteType } from 'models/Favorite'
import {
  setUsers,
  setVisibility
} from 'store/application/ui/userListModal/slice'
import {
  UserListType,
  UserListEntityType
} from 'store/application/ui/userListModal/types'

type OwnProps = {
  isMobile: boolean
  variant: ExploreCollectionsVariant
  children:
    | React.ComponentType<MobileCollectionsPageProps>
    | React.ComponentType<DesktopCollectionsPageProps>
}

type ExploreCollectionsPageProviderProps = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

const ExploreCollectionsPageProvider = ({
  isMobile,
  variant,
  collections,
  status,
  goToRoute,
  fetch,
  setRepostPlaylistId,
  setFavoritePlaylistId,
  setRepostUsers,
  setFavoriteUsers,
  setModalVisibility,
  children: Children
}: ExploreCollectionsPageProviderProps) => {
  const location = useLocation()
  const [info, setInfo] = useState<
    ExploreCollection | ExploreMoodCollection | null
  >(null)

  const onClickReposts = useCallback(
    (id: ID) => {
      if (isMobile) {
        setRepostPlaylistId(id)
        goToRoute(REPOSTING_USERS_ROUTE)
      } else {
        setRepostUsers(id)
        setModalVisibility()
      }
    },
    [
      isMobile,
      setRepostPlaylistId,
      goToRoute,
      setRepostUsers,
      setModalVisibility
    ]
  )
  const onClickFavorites = useCallback(
    (id: ID) => {
      if (isMobile) {
        setFavoritePlaylistId(id)
        goToRoute(FAVORITING_USERS_ROUTE)
      } else {
        setFavoriteUsers(id)
        setModalVisibility()
      }
    },
    [
      isMobile,
      setFavoritePlaylistId,
      goToRoute,
      setFavoriteUsers,
      setModalVisibility
    ]
  )

  useEffect(() => {
    if (variant === ExploreCollectionsVariant.MOOD) {
      // Mood playlist
      const match = matchPath<{
        mood: string
      }>(location.pathname, {
        path: EXPLORE_MOOD_PLAYLISTS_PAGE
      })
      if (match && match.params.mood) {
        const collectionInfo = EXPLORE_MOOD_COLLECTIONS_MAP[match.params.mood]
        fetch(variant, collectionInfo.moods)
        setInfo(collectionInfo)
      }
    } else if (variant === ExploreCollectionsVariant.DIRECT_LINK) {
      // no-op
    } else {
      // Other playlist/albums types (e.g. Top Playlist)
      fetch(variant)
      setInfo(EXPLORE_COLLECTIONS_MAP[variant])
    }
  }, [variant, fetch, location])

  const title = info
    ? info.variant === ExploreCollectionsVariant.MOOD
      ? `${info.title} Playlists`
      : info.title
    : ''
  const description = info ? info.subtitle || '' : ''

  const childProps = {
    title,
    description,
    collections,
    status,
    onClickReposts,
    onClickFavorites,
    goToRoute
  }

  const mobileProps = {}

  const desktopProps = {}

  return <Children {...childProps} {...mobileProps} {...desktopProps} />
}

function mapStateToProps(state: AppState, props: OwnProps) {
  return {
    collections: getCollections(state, { variant: props.variant }),
    status: getStatus(state, { variant: props.variant })
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    fetch: (variant: ExploreCollectionsVariant, moods?: string[]) =>
      dispatch(fetch({ variant, moods })),
    setRepostPlaylistId: (collectionId: ID) =>
      dispatch(setRepost(collectionId, RepostType.COLLECTION)),
    setFavoritePlaylistId: (collectionId: ID) =>
      dispatch(setFavorite(collectionId, FavoriteType.PLAYLIST)),
    setRepostUsers: (trackID: ID) =>
      dispatch(
        setUsers({
          userListType: UserListType.REPOST,
          entityType: UserListEntityType.COLLECTION,
          id: trackID
        })
      ),
    setFavoriteUsers: (trackID: ID) =>
      dispatch(
        setUsers({
          userListType: UserListType.FAVORITE,
          entityType: UserListEntityType.COLLECTION,
          id: trackID
        })
      ),
    setModalVisibility: () => dispatch(setVisibility(true)),
    goToRoute: (route: string) => dispatch(pushRoute(route))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExploreCollectionsPageProvider)
