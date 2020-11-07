import React, { useState, useCallback, useEffect } from 'react'
import cn from 'classnames'
import SimpleBar from 'simplebar-react-legacy'
import { Button, ButtonType, IconArrow } from '@audius/stems'

import SelectablePills from 'components/selectable-pill/SelectablePills'
import styles from './FollowPage.module.css'
import UserCard from 'components/card/UserCard'
import { ID } from 'models/common/Identifiers'
import User from 'models/User'
import { FollowArtistsCategory, artistCategories } from '../../store/types'

import { ReactComponent as IconWand } from 'assets/img/iconWand.svg'
const messages = {
  title: 'Follow At Least 3 Artists To Get Started',
  subTitle:
    'Tracks uploaded or reposted by people you follow will appear in your feed.',
  pickForMe: 'Pick Some For Me',
  following: 'Following'
}

const ENVIRONMENT = process.env.REACT_APP_ENVIRONMENT
const MINIMUM_FOLLOWER_COUNT =
  ENVIRONMENT === 'production' || ENVIRONMENT === 'staging' ? 3 : 0

// Because the cards are in a dynamically size container to allow wrapping user cards,
// The 'pick for me' text needs to align w/ the last user card, so it is checked manually
const isFourWide = window.innerWidth <= 1208
const FOUR_TILE_WIDTH = 736
const FIVE_TILE_WIDTH = 920

type FollowPageProps = {
  onNextPage: () => void
  selectedCategory: FollowArtistsCategory
  onSelectArtistCategory: (category: FollowArtistsCategory) => void
  onAddFollows: (ids: Array<ID>) => void
  onRemoveFollows: (ids: Array<ID>) => void
  onAutoSelect: () => void
  followedArtists: Array<ID>
  users: Array<User>
}

export const FollowPage = (props: FollowPageProps) => {
  const {
    onSelectArtistCategory,
    followedArtists,
    selectedCategory,
    onAddFollows,
    onRemoveFollows,
    onNextPage,
    onAutoSelect,
    users
  } = props

  const onToggleSelect = useCallback(
    (userId: ID) => () => {
      if (followedArtists.includes(userId)) {
        onRemoveFollows([userId])
      } else {
        onAddFollows([userId])
      }
    },
    [onAddFollows, onRemoveFollows, followedArtists]
  )

  const onClickNextPage = useCallback(() => {
    if (followedArtists.length >= MINIMUM_FOLLOWER_COUNT) {
      onNextPage()
    }
  }, [followedArtists, onNextPage])

  const [isTransitioning, setIsTransitioning] = useState(false)

  const onClickPillIndex = useCallback(
    (index: number) => {
      setIsTransitioning(true)
      onSelectArtistCategory(artistCategories[index])
    },
    [onSelectArtistCategory]
  )

  useEffect(() => {
    setIsTransitioning(false)
  }, [selectedCategory, setIsTransitioning])

  const seletablePillProps = {
    selectedIndex: artistCategories.findIndex(c => c === selectedCategory),
    onClickIndex: onClickPillIndex,
    content: artistCategories,
    disableDelayHandler: true
  }

  return (
    <div className={cn(styles.container)}>
      <div className={cn(styles.header)}>
        <div className={styles.title}>{messages.title}</div>
        <div className={styles.subTitle}>{messages.subTitle}</div>
      </div>
      <div className={styles.pillSection}>
        <SelectablePills {...seletablePillProps} />
      </div>
      {/* Typescript complains about no valid constructor, possibly
        due to the two simplebar packages we maintain.
      // @ts-ignore */}
      <SimpleBar className={styles.cardSection}>
        <div
          className={styles.cardsHeader}
          style={{ maxWidth: isFourWide ? FOUR_TILE_WIDTH : FIVE_TILE_WIDTH }}
        >
          <div className={styles.pickForMe} onClick={onAutoSelect}>
            <IconWand className={styles.iconWand} />
            {messages.pickForMe}
          </div>
        </div>
        <div
          className={cn(styles.cards, {
            [styles.hide]: isTransitioning,
            [styles.show]: !isTransitioning
          })}
        >
          {users.map((user, idx) => (
            <UserCard
              key={`${selectedCategory}-${idx}`}
              isMobile={false}
              name={user.name}
              id={user.user_id}
              imageSizes={user._profile_picture_sizes}
              selected={followedArtists.includes(user.user_id)}
              className={cn(styles.userCard)}
              isVerified={user.is_verified}
              followers={user.follower_count}
              onClick={onToggleSelect(user.user_id)}
            />
          ))}
        </div>
      </SimpleBar>
      <Button
        text='Continue'
        name='continue'
        rightIcon={<IconArrow />}
        type={
          followedArtists.length >= MINIMUM_FOLLOWER_COUNT
            ? ButtonType.PRIMARY_ALT
            : ButtonType.DISABLED
        }
        onClick={onClickNextPage}
        textClassName={styles.continueButtonText}
        className={styles.continueButton}
      />
      <div className={styles.followCount}>
        {`${messages.following} ${
          followedArtists.length > MINIMUM_FOLLOWER_COUNT
            ? followedArtists.length
            : `${followedArtists.length}/${MINIMUM_FOLLOWER_COUNT}`
        }`}
      </div>
    </div>
  )
}

export default FollowPage
