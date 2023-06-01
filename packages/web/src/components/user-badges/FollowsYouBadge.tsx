import { useWithMobileStyle } from 'hooks/useWithMobileStyle'

import styles from './FollowsYouBadge.module.css'

const messages = {
  followsYou: 'Follows You'
}

const FollowsYouBadge = ({
  className = '',
  transparentBackground = false
}: {
  className?: string
  transparentBackground?: boolean
}) => {
  const wm = useWithMobileStyle(styles.mobile)
  return (
    <div
      className={wm(
        styles.badge,
        { [styles.transparentBackground]: transparentBackground },
        className
      )}
    >
      {messages.followsYou}
    </div>
  )
}

export default FollowsYouBadge
