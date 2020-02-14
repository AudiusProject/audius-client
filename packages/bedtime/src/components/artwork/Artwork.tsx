import { h } from 'preact'

import styles from './Artwork.module.css'

interface ArtworkProps {
  onClickURL: string
  artworkURL: string
}

const Artwork = ({
  onClickURL,
  artworkURL
}: ArtworkProps) => {
  const onClick = () => {
    window.open(onClickURL, '_blank')
  }

  return (
    <div
      onClick={onClick}
      className={styles.albumArt}
      style={{ backgroundImage: `url(${artworkURL})`}}
    />
  )
}

export default Artwork


