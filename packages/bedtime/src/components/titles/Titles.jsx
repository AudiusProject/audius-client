import { h } from 'preact'

import IconVerified from '../../assets/img/iconVerified.svg'
import { getCopyableLink } from '../../util/shareUtil'
import styles from './Titles.module.css'

const Titles = ({
  title,
  handle,
  artistName,
  titleUrl,
  isVerified
}) => {
  const onClickTitle = () => {
    window.open(getCopyableLink(titleUrl), '_blank')
  }

  const onClickArtist = () => {
    window.open(getCopyableLink(handle), '_blank')
  }

  return (
    <div className={styles.titles}>
      <div
        className={styles.title}
        onClick={onClickTitle}>
        {title}
      </div>
      <div
        className={styles.artistName}
        onClick={onClickArtist}
      >
        {artistName}
        {isVerified && <IconVerified />}
      </div>
    </div>
  )
}

export default Titles
