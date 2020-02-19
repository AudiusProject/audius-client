import cn from 'classnames'
import { h } from 'preact'

import { getAudiusURL } from '../../util/shareUtil'
import styles from './Artwork.module.css'

interface ArtworkProps {
  onClickURL: string
  artworkURL: string
  className?: string
}

const Artwork = ({
  onClickURL,
  artworkURL,
  className
}: ArtworkProps) => {
  const onClick = () => {
    window.open(`${getAudiusURL()}/${onClickURL}`, '_blank')
  }

  return (
    <div
      onClick={onClick}
      className={cn(styles.albumArt, className)}
      style={{ backgroundImage: `url(${artworkURL})`}}
    />
  )
}

export default Artwork


