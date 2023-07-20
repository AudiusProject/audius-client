import { MouseEvent, useCallback, useRef, useState } from 'react'

import {
  FavoriteSource,
  Name,
  SquareSizes,
  Status,
  accountSelectors,
  collectionsSocialActions,
  tracksSocialActions,
  imageProfilePicEmpty,
  CreateAccountOpen
} from '@audius/common'
import { Scrollbar } from '@audius/stems'
import { ResizeObserver } from '@juggle/resize-observer'
import cn from 'classnames'
import { push as pushRoute } from 'connected-react-router'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import useMeasure from 'react-use-measure'
import { Dispatch } from 'redux'

import { make, useRecord } from 'common/store/analytics/actions'
import * as signOnActions from 'common/store/pages/signon/actions'
import { DragAutoscroller } from 'components/drag-autoscroller/DragAutoscroller'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import ConnectedProfileCompletionPane from 'components/profile-progress/ConnectedProfileCompletionPane'
import UserBadges from 'components/user-badges/UserBadges'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'
import { selectDraggingKind } from 'store/dragndrop/slice'
import { AppState } from 'store/types'
import {
  EXPLORE_PAGE,
  FEED_PAGE,
  HISTORY_PAGE,
  profilePage,
  LIBRARY_PAGE,
  TRENDING_PAGE
} from 'utils/route'

import { GroupHeader } from './GroupHeader'
import styles from './LeftNav.module.css'
import { LeftNavDroppable, LeftNavLink } from './LeftNavLink'
import NavAudio from './NavAudio'
import { NavButton } from './NavButton'
import { NavHeader } from './NavHeader'
import { NowPlayingArtworkTile } from './NowPlayingArtworkTile'
import { PlaylistLibrary } from './PlaylistLibrary'
import { RouteNav } from './RouteNav'

const { saveTrack } = tracksSocialActions
const { saveCollection } = collectionsSocialActions
const { getAccountStatus, getAccountUser } = accountSelectors

const messages = {
  discover: 'Discover',
  library: 'Your Music'
}

type OwnProps = {
  isElectron: boolean
}

type NavColumnProps = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  RouteComponentProps

const LeftNav = ({
  account,
  showActionRequiresAccount,
  isElectron,
  draggingKind,
  saveTrack,
  saveCollection,
  accountStatus,
  goToRoute,
  goToSignUp: routeToSignup,
  goToSignIn
}: NavColumnProps) => {
  const record = useRecord()
  const [navBodyContainerMeasureRef, navBodyContainerBoundaries] = useMeasure({
    polyfill: ResizeObserver
  })
  const scrollbarRef = useRef<HTMLElement | null>(null)
  const [dragScrollingDirection, setDragScrollingDirection] = useState<
    'up' | 'down' | undefined
  >(undefined)
  const handleChangeDragScrollingDirection = useCallback(
    (newDirection: 'up' | 'down' | undefined) => {
      setDragScrollingDirection(newDirection)
    },
    []
  )

  const goToSignUp = useCallback(
    (source: CreateAccountOpen['source']) => {
      routeToSignup()
      record(make(Name.CREATE_ACCOUNT_OPEN, { source }))
    },
    [record, routeToSignup]
  )

  const onClickNavProfile = useCallback(() => goToSignIn(), [goToSignIn])

  const goToProfile = useCallback(() => {
    if (account?.handle) {
      goToRoute(profilePage(account.handle))
    }
  }, [account, goToRoute])

  const onClickNavLinkWithAccount = useCallback(
    (e?: MouseEvent) => {
      if (!account) {
        e?.preventDefault()
        goToSignUp('restricted page')
        showActionRequiresAccount()
      }
    },
    [account, goToSignUp, showActionRequiresAccount]
  )

  const updateScrollTopPosition = useCallback((difference: number) => {
    if (scrollbarRef != null && scrollbarRef.current !== null) {
      scrollbarRef.current.scrollTop =
        scrollbarRef.current.scrollTop + difference
    }
  }, [])

  const profileCompletionMeter = (
    <div className={styles.profileCompletionContainer}>
      <ConnectedProfileCompletionPane />
    </div>
  )

  let name, handle
  if (account) {
    name = account.name
    handle = account.handle
  }

  const profileImage = useUserProfilePicture(
    account ? account.user_id : null,
    account ? account._profile_picture_sizes : null,
    SquareSizes.SIZE_150_BY_150
  )

  const navLoaded =
    accountStatus === Status.SUCCESS || accountStatus === Status.ERROR

  return (
    <nav id='leftNav' className={styles.leftNav}>
      {isElectron ? <RouteNav /> : null}
      <NavHeader />
      <div
        ref={navBodyContainerMeasureRef}
        className={cn(styles.leftNavContent, {
          [styles.show]: navLoaded,
          [styles.dragScrollingUp]: dragScrollingDirection === 'up',
          [styles.dragScrollingDown]: dragScrollingDirection === 'down'
        })}
      >
        <Scrollbar
          containerRef={(el: HTMLElement) => {
            scrollbarRef.current = el
          }}
          className={styles.scrollable}
        >
          <DragAutoscroller
            containerBoundaries={navBodyContainerBoundaries}
            updateScrollTopPosition={updateScrollTopPosition}
            onChangeDragScrollingDirection={handleChangeDragScrollingDirection}
          >
            {account ? (
              <div className={styles.userHeader}>
                <div className={styles.accountWrapper}>
                  <DynamicImage
                    wrapperClassName={styles.wrapperPhoto}
                    className={styles.dynamicPhoto}
                    skeletonClassName={styles.wrapperPhotoSkeleton}
                    onClick={goToProfile}
                    image={profileImage}
                  />
                  <div className={styles.userInfoWrapper}>
                    <div className={styles.name} onClick={goToProfile}>
                      <div className={styles.nameText}>{name}</div>
                      <UserBadges
                        userId={account.user_id}
                        badgeSize={12}
                        className={styles.badge}
                      />
                    </div>
                    <div className={styles.handleContainer}>
                      <span
                        className={styles.handle}
                        onClick={goToProfile}
                      >{`@${handle}`}</span>
                    </div>
                  </div>
                </div>
                <NavAudio />
              </div>
            ) : (
              <div className={styles.userHeader}>
                <div className={styles.accountWrapper}>
                  <div
                    className={styles.photo}
                    style={{ backgroundImage: `url(${imageProfilePicEmpty})` }}
                    onClick={onClickNavProfile}
                  />
                  <div className={styles.userInfoWrapper}>
                    <div className={styles.haveAccount}>Have an Account?</div>
                    <div className={styles.logIn} onClick={onClickNavProfile}>
                      Sign In
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.links}>
              <div className={styles.linkGroup}>
                <GroupHeader>{messages.discover}</GroupHeader>
                <LeftNavLink
                  to={FEED_PAGE}
                  disabled={!account}
                  onClick={onClickNavLinkWithAccount}
                >
                  Feed
                </LeftNavLink>
                <LeftNavLink to={TRENDING_PAGE}>Trending</LeftNavLink>
                <LeftNavLink to={EXPLORE_PAGE} exact>
                  Explore
                </LeftNavLink>
              </div>
              <div className={styles.linkGroup}>
                <GroupHeader>{messages.library}</GroupHeader>
                <LeftNavDroppable
                  disabled={!account}
                  acceptedKinds={['track', 'album']}
                  acceptOwner={false}
                  onDrop={draggingKind === 'album' ? saveCollection : saveTrack}
                >
                  <LeftNavLink
                    to={LIBRARY_PAGE}
                    onClick={onClickNavLinkWithAccount}
                  >
                    Library
                  </LeftNavLink>
                </LeftNavDroppable>
                <LeftNavLink
                  to={HISTORY_PAGE}
                  onClick={onClickNavLinkWithAccount}
                  disabled={!account}
                >
                  History
                </LeftNavLink>
              </div>
              <div className={styles.linkGroup}>
                <PlaylistLibrary scrollbarRef={scrollbarRef} />
              </div>
            </div>
          </DragAutoscroller>
        </Scrollbar>
      </div>
      <div className={styles.navAnchor}>
        {profileCompletionMeter}
        <NavButton />
        <NowPlayingArtworkTile />
      </div>
    </nav>
  )
}

const mapStateToProps = (state: AppState) => {
  return {
    account: getAccountUser(state),
    accountStatus: getAccountStatus(state),
    draggingKind: selectDraggingKind(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goToRoute: (route: string) => dispatch(pushRoute(route)),
  saveTrack: (trackId: number) =>
    dispatch(saveTrack(trackId, FavoriteSource.NAVIGATOR)),
  saveCollection: (collectionId: number) =>
    dispatch(saveCollection(collectionId, FavoriteSource.NAVIGATOR)),
  showActionRequiresAccount: () =>
    dispatch(signOnActions.showRequiresAccountModal()),
  goToSignUp: () => dispatch(signOnActions.openSignOn(/** signIn */ false)),
  goToSignIn: () => dispatch(signOnActions.openSignOn(/** signIn */ true))
})

const ConnectedLeftNav = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(LeftNav)
)

export default ConnectedLeftNav
