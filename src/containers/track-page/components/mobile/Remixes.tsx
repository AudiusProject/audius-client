import React from 'react'

import { ID } from 'models/common/Identifiers'
import { ReactComponent as IconRemix } from 'assets/img/iconRemix.svg'
import SectionButton from 'components/general/SectionButton'
import ConnectedRemixCard from 'containers/remix/ConnectedRemixCard'

import styles from './Remixes.module.css'

const messages = {
  title: 'Remixes',
  viewAll: (count: number | null) =>
    `View All ${count && count > 6 ? count : ''} Remixes`
}

type RemixesProps = {
  trackIds: ID[]
  goToAllRemixes: () => void
  count: number | null
}

const Remixes = ({ trackIds, goToAllRemixes, count }: RemixesProps) => {
  return (
    <div className={styles.remixes}>
      <div className={styles.header}>
        <IconRemix className={styles.iconRemix} />
        <span>{messages.title}</span>
      </div>
      <div className={styles.tracks}>
        {trackIds.map(id => {
          return <ConnectedRemixCard key={id} trackId={id} />
        })}
      </div>
      <div className={styles.button}>
        <SectionButton
          isMobile
          text={messages.viewAll(count)}
          onClick={goToAllRemixes}
        />
      </div>
    </div>
  )
}

export default Remixes
