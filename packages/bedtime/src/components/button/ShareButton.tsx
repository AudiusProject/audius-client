import { h } from 'preact'
import IconShare from '../../assets/img/iconShare.svg'
import Button from './Button'

import styles from './ShareButton.module.css'

interface ShareButtonProps {
  url: string
}


const ShareButton = ({ url }: ShareButtonProps) => {

  // TODO
  const onShare = () => {
    console.log(url)
  }

  return (
    <Button
      icon={<IconShare/>}
      onClick={onShare}
      className={styles.container}
    />
  )
}

export default ShareButton

