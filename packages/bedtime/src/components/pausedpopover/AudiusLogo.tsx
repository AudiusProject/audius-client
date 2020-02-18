import { h } from 'preact'
import FullColorLogo from '../../assets/img/Horizontal-Logo-Full-Color.png'

import styles from './AudiusLogo.module.css'

const AudiusLogo = () => {
  const onClick = () => {
    // TODO: correct hostname
    window.open('https://audius.co', '_blank')
  }

  return (
    <div
      className={styles.container}
      style={{ backgroundImage: `url(${FullColorLogo})` }}
      onClick={onClick}
    />
  )
}

export default AudiusLogo

