import {
  CallToActionBanner,
  CallToActionBannerProps
} from './CallToActionBanner'
import styles from './UpdateAppBanner.module.css'

const messages = {
  text: 'A New Version Is Available',
  pill: 'Close and update'
}

type UpdateAppBannerProps = Pick<
  CallToActionBannerProps,
  'onAccept' | 'onClose'
>

export const UpdateAppBanner = ({
  onAccept,
  onClose
}: UpdateAppBannerProps) => {
  return (
    <CallToActionBanner
      text={<span className={styles.text}>{messages.text}</span>}
      pill={messages.pill}
      pillPosition={'right'}
      emoji='sparkles'
      onClose={onClose}
      onAccept={onAccept}
    />
  )
}
