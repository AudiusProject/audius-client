import { useState, useEffect, memo, useCallback } from 'react'

import {
  Kind,
  imageBlank as placeholderArt,
  cacheUsersActions,
  cacheUsersSelectors
} from '@audius/common'
import { Tag } from '@audius/stems'
import cn from 'classnames'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'

import { useSelector } from 'common/hooks/useSelector'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import { TwitterShareButton } from 'components/notification/Notification/components/TwitterShareButton'
import { TwitterButton } from 'components/social-button'
import UserBadges from 'components/user-badges/UserBadges'
import { audiusBackendInstance } from 'services/audius-backend/audius-backend-instance'
import { openTwitterLink } from 'utils/tweet'

import styles from './SearchBarResult.module.css'

const HOSTNAME = process.env.REACT_APP_PUBLIC_HOSTNAME
const PROTOCOL = process.env.REACT_APP_PUBLIC_PROTOCOL

const messages = {
  disabledTag: 'Ai Attrib. Not Enabled',
  tweet: (handle) =>
    `Hey ${handle}, imagine AI generated tracks inspired by your sound! 🤖 Enable AI generated music on @AudiusMusic and see what your fans create using your tunes as their muse. #AudiusAI`
}

const Image = memo((props) => {
  const { defaultImage, imageMultihash, size, isUser } = props
  const [image, setImage] = useState(imageMultihash ? '' : defaultImage)
  useEffect(() => {
    if (!imageMultihash) return
    let isCanceled = false
    const getImage = async () => {
      try {
        const gateways = audiusBackendInstance.getCreatorNodeIPFSGateways(
          props.creatorNodeEndpoint
        )
        const url = await audiusBackendInstance.getImageUrl(
          imageMultihash,
          size,
          gateways
        )
        if (!isCanceled) setImage(url || defaultImage)
      } catch (err) {
        if (!isCanceled) setImage(defaultImage)
      }
    }
    getImage()
    return () => {
      isCanceled = true
    }
  }, [defaultImage, imageMultihash, props.creatorNodeEndpoint, size])
  return (
    <DynamicImage
      skeletonClassName={cn({ [styles.userImageContainerSkeleton]: isUser })}
      wrapperClassName={cn(styles.imageContainer)}
      className={cn({
        [styles.image]: image,
        [styles.userImage]: isUser,
        [styles.emptyUserImage]: isUser && image === defaultImage
      })}
      image={image}
    />
  )
})

const SearchBarResult = memo((props) => {
  const {
    kind,
    id,
    userId,
    sizes,
    primary,
    secondary,
    imageMultihash,
    creatorNodeEndpoint,
    size,
    defaultImage,
    isVerifiedUser,
    tier,
    allowAiAttribution,
    name,
    handle
  } = props
  const isUser = kind === Kind.USERS
  const { fetchUserSocials } = cacheUsersActions
  const { getUser } = cacheUsersSelectors
  const dispatch = useDispatch()
  const user = useSelector((state) => getUser(state, { handle }))

  useEffect(() => {
    dispatch(fetchUserSocials(handle))
  }, [dispatch, fetchUserSocials, handle])

  const handleTweet = useCallback(() => {
    const url = `${PROTOCOL}//${HOSTNAME}/${handle}`
    const text = openTwitterLink(url, text)
  }, [handle, name, user])

  const handleTwitterShare = useCallback((handle: string) => {
    const shareText = messages.tweet(handle)
    return { shareText }
  }, [])

  return (
    <div className={styles.searchBarResultContainer}>
      <span className={styles.userInfo}>
        <Image
          kind={kind}
          isUser={isUser}
          id={id}
          sizes={sizes}
          imageMultihash={imageMultihash}
          creatorNodeEndpoint={creatorNodeEndpoint}
          defaultImage={defaultImage}
          size={size}
        />
        <div
          className={cn(styles.textContainer, {
            [styles.disabled]: !allowAiAttribution
          })}
        >
          <span
            className={cn(styles.primaryContainer, {
              [styles.hoverable]: allowAiAttribution
            })}
          >
            <div className={styles.primaryText}>{primary}</div>
            {isUser && (
              <UserBadges
                className={styles.verified}
                userId={userId}
                badgeSize={12}
                isVerifiedOverride={isVerifiedUser}
                overrideTier={tier}
              />
            )}
          </span>
          {secondary ? (
            <span className={cn(styles.secondaryContainer)}>
              <span>{secondary}</span>
              {!isUser && (
                <UserBadges
                  className={styles.verified}
                  userId={userId}
                  badgeSize={10}
                  isVerifiedOverride={isVerifiedUser}
                  overrideTier={tier}
                />
              )}
            </span>
          ) : null}
        </div>
      </span>
      {!allowAiAttribution ? (
        <>
          <Tag tag={messages.disabledTag} />
          <TwitterShareButton
            className={styles.twitterButton}
            type='dynamic'
            handle={handle}
            name={name}
            shareData={handleTwitterShare}
            hideText
          />
        </>
      ) : null}
    </div>
  )
})

SearchBarResult.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  primary: PropTypes.string.isRequired,
  secondary: PropTypes.string,
  kind: PropTypes.string,
  id: PropTypes.string,
  sizes: PropTypes.object,
  imageMultihash: PropTypes.string,
  creatorNodeEndpoint: PropTypes.string,
  size: PropTypes.string,
  defaultImage: PropTypes.string,
  isVerifiedUser: PropTypes.bool
}

SearchBarResult.defaultProps = {
  imageUrl: placeholderArt
}

export default SearchBarResult
