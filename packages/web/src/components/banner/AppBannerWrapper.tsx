import cn from 'classnames'

import { isMobile } from 'utils/clientUtil'

import styles from './AppBannerWrapper.module.css'

/**
 * Contains all the banners. Useful for mobile web to allow this to switch to fixed positioning,
 * but also would like to see this control the banner list instead of App.js if it's possible to decouple some of the logic
 */
export const AppBannerWrapper = ({
  children
}: {
  children: React.ReactNode
}) => (
  <div className={cn(styles.root, { [styles.isMobile]: isMobile() })}>
    {children}
  </div>
)
