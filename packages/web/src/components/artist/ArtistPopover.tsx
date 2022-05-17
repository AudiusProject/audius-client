import React, { useCallback, memo, ReactNode } from 'react'

import Popover from 'antd/lib/popover'
import cn from 'classnames'
import { push as pushRoute } from 'connected-react-router'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { useSelector } from 'common/hooks/useSelector'
import { FollowSource } from 'common/models/Analytics'
import { ID } from 'common/models/Identifiers'
import { WidthSizes, SquareSizes } from 'common/models/ImageSizes'
import { getUserId } from 'common/store/account/selectors'
import { getUser } from 'common/store/cache/users/selectors'
import { setNotificationSubscription } from 'common/store/pages/profile/actions'
import * as socialActions from 'common/store/social/users/actions'
import { getSupporting } from 'common/store/tipping/selectors'
import { stringWeiToBN } from 'common/utils/wallet'
import { MountPlacement } from 'components/types'
import { useUserCoverPhoto } from 'hooks/useUserCoverPhoto'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'
import { AppState } from 'store/types'
import { profilePage } from 'utils/route'

import { ArtistCard } from './ArtistCard'
import styles from './ArtistPopover.module.css'

enum Placement {
  Top = 'top',
  Left = 'left',
  Right = 'right',
  Bottom = 'bottom',
  TopLeft = 'topLeft',
  TopRight = 'topRight',
  BottomLeft = 'bottomLeft',
  BottomRight = 'bottomRight',
  LeftTop = 'leftTop',
  LeftBottom = 'leftBottom',
  RightTop = 'rightTop',
  RightBottom = 'rightBottom'
}

type ArtistPopoverProps = {
  mount: MountPlacement
  handle: string
  placement: Placement
  creator: any
  goToRoute: (route: string) => void
  onFollow: (userId: ID) => void
  onUnfollow: (userId: ID) => void
  children: ReactNode
  mouseEnterDelay: number
  component?: 'div' | 'span'
} & ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

const ArtistPopover = ({
  handle,
  onFollow,
  onUnfollow,
  children,
  placement,
  creator,
  userId,
  goToRoute,
  mount,
  mouseEnterDelay,
  component: Component = 'div'
}: ArtistPopoverProps) => {
  const getCoverPhoto = useUserCoverPhoto(
    creator ? creator.user_id : null,
    creator ? creator._cover_photo_sizes : null,
    WidthSizes.SIZE_640,
    undefined,
    true
  )
  const getProfilePicture = useUserProfilePicture(
    creator ? creator.user_id : null,
    creator ? creator._profile_picture_sizes : null,
    SquareSizes.SIZE_150_BY_150,
    undefined,
    true
  )

  const supportingMap = useSelector(getSupporting)
  const supportingForCreator = creator?.user_id
    ? supportingMap[creator.user_id] ?? {}
    : {}
  const rankedSupportingList = Object.keys(supportingForCreator)
    .sort((k1, k2) => {
      const amount1BN = stringWeiToBN(
        supportingForCreator[(k1 as unknown) as ID].amount
      )
      const amount2BN = stringWeiToBN(
        supportingForCreator[(k2 as unknown) as ID].amount
      )
      return amount1BN.gte(amount2BN) ? -1 : 1
    })
    .map(k => supportingForCreator[(k as unknown) as ID])

  // todo: hide hover tile on click
  const onSupportingClick = () => {}

  const onMouseEnter = useCallback(() => {
    getCoverPhoto()
    getProfilePicture()
  }, [getCoverPhoto, getProfilePicture])

  const onClickFollow = useCallback(() => {
    if (creator && creator.user_id) onFollow(creator.user_id)
  }, [creator, onFollow])

  const onClickUnfollow = useCallback(() => {
    if (creator && creator.user_id) onUnfollow(creator.user_id)
  }, [creator, onUnfollow])

  const onNameClick = useCallback(() => {
    goToRoute(profilePage(handle))
  }, [handle, goToRoute])

  const content =
    creator && userId !== creator.user_id ? (
      <ArtistCard
        artist={creator}
        onNameClick={onNameClick}
        onFollow={onClickFollow}
        onUnfollow={onClickUnfollow}
        supportingList={rankedSupportingList}
        supportingCount={creator.supporting_count}
        onSupportingClick={onSupportingClick}
      />
    ) : null

  let popupContainer
  switch (mount) {
    case MountPlacement.PARENT:
      popupContainer = (triggerNode: HTMLElement) =>
        triggerNode.parentNode as HTMLElement
      break
    case MountPlacement.PAGE:
      popupContainer = () => document.getElementById('page') || document.body
      break
    default:
      popupContainer = undefined
  }

  return (
    <Component
      className={cn(styles.popoverContainer, 'artistPopover')}
      onMouseEnter={onMouseEnter}
    >
      <Popover
        mouseEnterDelay={mouseEnterDelay}
        content={content}
        overlayClassName={styles.overlayStyle}
        placement={placement}
        getPopupContainer={popupContainer}
      >
        {children}
      </Popover>
    </Component>
  )
}

const mapStateToProps = (state: AppState, { handle = '' }) => ({
  creator: getUser(state, { handle: handle.toLowerCase() }),
  userId: getUserId(state)
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goToRoute: (route: string) => dispatch(pushRoute(route)),
  onFollow: (userId: ID) =>
    dispatch(socialActions.followUser(userId, FollowSource.HOVER_TILE)),
  onUnfollow: (userId: ID) => {
    dispatch(socialActions.unfollowUser(userId, FollowSource.HOVER_TILE))
    dispatch(setNotificationSubscription(userId, false, true))
  }
})

ArtistPopover.defaultProps = {
  mount: MountPlacement.PAGE,
  handle: '',
  placement: Placement.RightBottom,
  mouseEnterDelay: 0.5
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(ArtistPopover))
