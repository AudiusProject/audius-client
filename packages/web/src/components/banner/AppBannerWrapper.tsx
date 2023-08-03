import styles from './AppBannerWrapper.module.css'

export const AppBannerWrapper = ({
  children
}: {
  children: React.ReactNode
}) => <div className={styles.root}>{children}</div>
