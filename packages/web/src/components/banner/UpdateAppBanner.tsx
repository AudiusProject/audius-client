import {
  CallToActionBanner,
  CallToActionBannerProps
} from './CallToActionBanner'
import styles from './UpdateAppBanner.module.css'

const messages = {
  text: 'A New Version Is Available',
  pill: 'Close and update'
}

export const UpdateAppBanner = ({
  onAccept,
  onClose
}: Pick<CallToActionBannerProps, 'onAccept' | 'onClose'>) => {
  return (
    <CallToActionBanner
      text={<span className={styles.text}>{messages.text}</span>}
      pill={messages.pill}
      pillPosition={'right'}
      emoji='sparkles'
      isElectron
      onClose={onClose}
      onAccept={onAccept}
    />
  )
}
