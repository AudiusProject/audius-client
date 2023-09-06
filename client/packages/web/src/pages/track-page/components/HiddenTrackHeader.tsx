import { IconHidden } from '@audius/stems'
import cn from 'classnames'

import typeStyles from 'components/typography/typography.module.css'

import styles from './HiddenTrackHeader.module.css'

const messages = {
  hiddenTrackTitle: 'Hidden Track'
}

// Presents the Hidden Track title. Extracted for use in mobile and desktop
// track pages.
const HiddenTrackHeader = () => {
  return (
    <span className={styles.root}>
      <IconHidden className={styles.icon} />
      <div
        className={cn(
          typeStyles.titleSmall,
          typeStyles.titleWeak,
          styles.label
        )}
      >
        {messages.hiddenTrackTitle}
      </div>
    </span>
  )
}

export default HiddenTrackHeader
