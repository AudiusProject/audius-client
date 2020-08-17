import React from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  ButtonSize,
  ButtonType,
  IconShare,
  IconPencil
} from '@audius/stems'

import FollowButton from 'components/general/FollowButton'
import SubscribeButton from 'components/general/SubscribeButton'
import Stats from 'components/general/Stats'
import Toast from 'components/toast/Toast'
import styles from './StatBanner.module.css'

const BUTTON_COLLAPSE_WIDTHS = {
  first: 1066,
  second: 1140
}

const SHARE_TIMEOUT = 1500

const StatBanner = props => {
  let buttonOne, buttonTwo, subscribeButton

  switch (props.mode) {
    case 'owner':
      buttonOne = (
        <Toast
          text={'Copied To Clipboard!'}
          delay={SHARE_TIMEOUT}
          fillParent={false}
          placement='left'
        >
          <Button
            size={ButtonSize.SMALL}
            type={ButtonType.COMMON}
            text='SHARE'
            leftIcon={<IconShare />}
            onClick={props.onShare}
            widthToHideText={BUTTON_COLLAPSE_WIDTHS.first}
          />
        </Toast>
      )
      buttonTwo = (
        <Button
          key='edit'
          className={styles.buttonTwo}
          size={ButtonSize.SMALL}
          type={ButtonType.SECONDARY}
          text='EDIT PAGE'
          leftIcon={<IconPencil />}
          onClick={props.onEdit}
          widthToHideText={BUTTON_COLLAPSE_WIDTHS.second}
        />
      )
      break
    case 'editing':
      buttonOne = (
        <Button
          size={ButtonSize.SMALL}
          type={ButtonType.COMMON}
          text='CANCEL'
          onClick={props.onCancel}
        />
      )
      buttonTwo = (
        <Button
          key='save'
          className={styles.buttonTwo}
          size={ButtonSize.SMALL}
          type={ButtonType.PRIMARY_ALT}
          text='SAVE CHANGES'
          onClick={props.onSave}
        />
      )
      break
    default:
      buttonOne = (
        <Toast
          text={'Copied To Clipboard!'}
          delay={SHARE_TIMEOUT}
          fillParent={false}
          requireAccount={false}
          placement='left'
        >
          <Button
            size={ButtonSize.SMALL}
            type={ButtonType.COMMON}
            text='SHARE'
            leftIcon={<IconShare />}
            onClick={props.onShare}
            widthToHideText={BUTTON_COLLAPSE_WIDTHS.first}
          />
        </Toast>
      )
      buttonTwo = (
        <FollowButton
          following={props.following}
          onFollow={props.onFollow}
          onUnfollow={props.onUnfollow}
          widthToHideText={BUTTON_COLLAPSE_WIDTHS.second}
        />
      )
      if (props.onToggleSubscribe) {
        subscribeButton = (
          <SubscribeButton
            className={styles.subscribeButton}
            isSubscribed={props.isSubscribed}
            isFollowing={props.following}
            onToggleSubscribe={props.onToggleSubscribe}
          />
        )
      }
      break
  }

  return (
    <div className={styles.wrapper}>
      {!props.empty ? (
        <div className={styles.statBanner}>
          <div className={styles.stats}>
            <Stats
              userId={props.userId}
              stats={props.stats}
              size='large'
              followers={props.followers}
              followees={props.followees}
              followersLoading={props.followersLoading}
              followeesLoading={props.followeesLoading}
              loadMoreFollowers={props.loadMoreFollowers}
              loadMoreFollowees={props.loadMoreFollowees}
              onClickArtistName={props.onClickArtistName}
            />
          </div>
          <div className={styles.buttons}>
            {buttonOne}
            {subscribeButton}
            {buttonTwo}
          </div>
        </div>
      ) : null}
    </div>
  )
}

StatBanner.propTypes = {
  stats: PropTypes.array,
  mode: PropTypes.oneOf(['visitor', 'owner', 'editing']),
  empty: PropTypes.bool,
  handle: PropTypes.string,
  userId: PropTypes.number,
  onClickArtistName: PropTypes.func,
  loadMoreFollowers: PropTypes.func,
  loadMoreFollowees: PropTypes.func,
  onEdit: PropTypes.func,
  onShare: PropTypes.func,
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
  onFollow: PropTypes.func,
  onUnfollow: PropTypes.func,
  following: PropTypes.bool,
  followers: PropTypes.array,
  followees: PropTypes.array,
  followersLoading: PropTypes.bool,
  followeesLoading: PropTypes.bool,
  isSubscribed: PropTypes.bool,
  onToggleSubscribe: PropTypes.func
}

StatBanner.defaultProps = {
  stats: [
    { number: 0, title: 'tracks' },
    { number: 0, title: 'followers' },
    { number: 0, title: 'reposts' }
  ],
  mode: 'visitor',
  empty: false
}

export default StatBanner
