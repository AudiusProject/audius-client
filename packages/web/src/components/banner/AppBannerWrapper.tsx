import cn from 'classnames'

import { isMobile } from 'utils/clientUtil'

import styles from './AppBannerWrapper.module.css'

export const AppBannerWrapper = ({
  children
}: {
  children: React.ReactNode
}) => (
  <div className={cn(styles.root, { [styles.isMobile]: isMobile() })}>
    {children}
  </div>
)
