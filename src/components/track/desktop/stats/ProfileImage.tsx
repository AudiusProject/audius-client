import React, { memo } from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import cn from 'classnames'

import styles from './ProfileImage.module.css'
import { useUserProfilePicture } from 'hooks/useImageSize'
import { SquareSizes } from 'models/common/ImageSizes'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import { AppState } from 'store/types'
import { ID } from 'models/common/Identifiers'
import { getUser } from 'store/cache/users/selectors'

type OwnProps = {
  userId: ID
}

type ProfileImageProps = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

const ProfileImage = memo(({ userId, user }: ProfileImageProps) => {
  const image = useUserProfilePicture(
    userId,
    user ? user._profile_picture_sizes : null,
    SquareSizes.SIZE_150_BY_150
  )
  return (
    <DynamicImage
      wrapperClassName={cn(styles.wrapper)}
      className={styles.image}
      image={image}
    />
  )
})

function mapStateToProps(state: AppState, ownProps: OwnProps) {
  return {
    user: getUser(state, { id: ownProps.userId })
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileImage)
