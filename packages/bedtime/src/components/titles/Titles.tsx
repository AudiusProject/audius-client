import { h } from 'preact'
import IconVerified from '../../assets/img/iconVerified.svg'

import { getAudiusURL } from '../../util/shareUtil'
import styles from './Titles.module.css'


interface TitlesProps {
  title: string
  artistName: string
  handle: string
  titleUrl: string
  isVerified: boolean
}

const Titles = ({
  title,
  handle,
  artistName,
  titleUrl,
  isVerified
}: TitlesProps) => {
  const onClickTitle = () => {
    window.open(`${getAudiusURL()}/${titleUrl}`, '_blank')
  }

  const onClickArtist = () => {
    window.open(`${getAudiusURL()}/${handle}`, '_blank')
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

