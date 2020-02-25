import { h } from 'preact'
import Button from '../button/Button'
import AudiusLogo from '../../assets/img/audiusLogoHorizontal.svg'
import FullColorLogo from '../../assets/img/Horizontal-Logo-Full-Color.png'
import { getAudiusURL } from '../../util/shareUtil'
import cn from 'classnames'

import styles from './DeletedContent.module.css'

const messages = {
  mainLabel: 'This content was removed by the creator.',
  subLabel1: 'Unlimited Uploads.',
  subLabel2: '320kbps Streaming.',
  subLabel3: '100% Free.',
  buttonLabel: 'Find more on'
}

const DeletedContent = ({ isCard }) => {
  const onClickFindMore = () => {
    window.open(getAudiusURL(), '_blank')
  }

  return (
    <div className={cn(styles.container, { [styles.cardContainer]: isCard })}>
      {
        isCard &&
        <div
          className={styles.logo}
          style={{
            background: `url(${FullColorLogo})`
          }}
        />
      }
      <div className={styles.label}>
        {messages.mainLabel}
      </div>
      {
        isCard &&
        <div className={styles.subLabel}>
          <span>
            {messages.subLabel1}
          </span>
          <span>
            {messages.subLabel2}
          </span>
          <span>
            {messages.subLabel3}
          </span>
        </div>
      }
      <Button
        className={styles.button}
        onClick={onClickFindMore}
        label={messages.buttonLabel}
        icon={<AudiusLogo />}
      />
    </div>
  )
}

export default DeletedContent

