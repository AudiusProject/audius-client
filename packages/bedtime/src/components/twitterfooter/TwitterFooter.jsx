import { h } from 'preact'
import FullColorLogo from '../../assets/img/Horizontal-Logo-Full-Color.png'
import { getAudiusURL } from '../../util/shareUtil'

import styles from './TwitterFooter.module.css'

const messages = {
  title: 'Listen on'
}

const TwitterFooter = ({ onClickPath }) => {

  const onClick = () => window.open(`${getAudiusURL()}/${onClickPath}`, '_blank')

  return (
    <div
      className={styles.container}
      onClick={onClick}
    >
      {messages.title}
      <div
        style={{ background: `url(${FullColorLogo})`}}
        className={styles.logo}/>
    </div>
  )
}

export default TwitterFooter
