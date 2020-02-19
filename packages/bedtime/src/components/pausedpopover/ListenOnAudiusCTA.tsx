import { h } from 'preact'
import AudiusLogo from '../../assets/img/audiusLogoHorizontal.svg'
import Button from '../button/Button'

import { getAudiusURL } from '../../util/shareUtil'
import styles from './ListenOnAudiusCTA.module.css'

interface ListenOnAudiusCTAProps {
  audiusURL: string
}

const messages = {
  label: 'Listen on'
}

const ListenOnAudiusCTA = ({ audiusURL }: ListenOnAudiusCTAProps) => {
  const onClick = () => {
    window.open(`${getAudiusURL()}/${audiusURL}`, '_blank')
  }

  return (
    <Button
      onClick={onClick}
      className={styles.container}
      icon={<AudiusLogo />}
      label={messages.label}
    />
  )
}

export default ListenOnAudiusCTA

