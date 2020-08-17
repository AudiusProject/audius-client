import React, { useCallback } from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'

import { AppState } from 'store/types'
import AudiusModal from 'components/general/AudiusModal'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import TwitterButton from 'components/general/TwitterButton'
import MusicConfetti from 'components/background-animations/MusicConfetti'
import { getAccountUser } from 'store/account/selectors'
import { getIsOpen } from './store/selectors'
import { setVisibility } from './store/slice'
import { withNullGuard } from 'utils/withNullGuard'
import { useUserProfilePicture } from 'hooks/useImageSize'
import { SquareSizes } from 'models/common/ImageSizes'

import styles from './FirstUploadModal.module.css'
import { ReactComponent as IconVerified } from 'assets/img/iconVerified.svg'
import { openTwitterLink } from 'utils/tweet'
import { fullProfilePage } from 'utils/route'
import { useRecord, make } from 'store/analytics/actions'
import { Name } from 'services/analytics'

const messages = {
  first: 'You just uploaded your first track to Audius!',
  deal: 'That’s a pretty big deal.',
  share: 'Share with your fans and let them know you’re here!',
  shareButton: 'Share With Your Fans',
  // Note: twitter auto appends the link to the text
  tweet:
    'I just joined @AudiusProject and uploaded my first track! Check out my profile here: '
}

const Title = () => {
  return (
    <div className={styles.title}>
      <span>Congratulations</span>
      <i className='emoji face-with-party-horn-and-party-hat xl' />
    </div>
  )
}

type OwnProps = {}
type FirstUploadModalProps = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

const g = withNullGuard(
  ({ account, ...p }: FirstUploadModalProps) => account && { ...p, account }
)

const FirstUploadModal = g(({ account, isOpen, close }) => {
  const image = useUserProfilePicture(
    account.user_id,
    account._profile_picture_sizes,
    SquareSizes.SIZE_480_BY_480
  )

  const record = useRecord()
  const onShare = useCallback(() => {
    const url = fullProfilePage(account.handle)
    const text = messages.tweet
    openTwitterLink(url, text)
    record(make(Name.TWEET_FIRST_UPLOAD, { handle: account.handle }))
  }, [account, record])

  return (
    <>
      <AudiusModal
        isOpen={isOpen}
        onClose={close}
        bodyClassName={styles.modalBody}
        contentHorizontalPadding={32}
        showTitleHeader
        showDismissButton
        dismissOnClickOutside={false}
        title={<Title />}
      >
        <div className={styles.content}>
          <div className={styles.artist}>
            <DynamicImage image={image} wrapperClassName={styles.image} />
            <div className={styles.name}>
              <span>{account.name}</span>
              {account.is_verified && (
                <IconVerified className={styles.iconVerified} />
              )}
            </div>
            <div className={styles.handle}>{`@${account.handle}`}</div>
          </div>
          <div className={styles.callToAction}>
            <div className={styles.text}>{messages.first}</div>
            <div className={styles.text}>{messages.deal}</div>
            <div className={styles.text}>{messages.share}</div>
            <TwitterButton
              size='large'
              onClick={onShare}
              className={styles.tweetButton}
              textLabel={messages.shareButton}
            />
          </div>
        </div>
      </AudiusModal>
      {isOpen && <MusicConfetti />}
    </>
  )
})

function mapStateToProps(state: AppState) {
  return {
    account: getAccountUser(state),
    isOpen: getIsOpen(state)
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    close: () => dispatch(setVisibility({ isOpen: false }))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FirstUploadModal)
