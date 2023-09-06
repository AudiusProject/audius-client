import { memo } from 'react'

import PropTypes from 'prop-types'

import { ReactComponent as LogoSVG } from 'assets/img/audiusLogoGlyph.svg'

import styles from './EndOfLineup.module.css'

export const EndOfLineup = (props) => {
  const { title, description } = props

  return (
    <div className={styles.endOfLineup} key='endOfLineup'>
      <LogoSVG className={styles.endOfLineupLogo} />
      <div className={styles.endTitle}>{title}</div>
      <div className={styles.endDescriptionContainer}>
        <div className={styles.divider} />
        <div className={styles.endDescription}>{description}</div>
        <div className={styles.divider} />
      </div>
    </div>
  )
}

EndOfLineup.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string
}

EndOfLineup.defaultProps = {
  title: 'End of the line',
  description: 'Looks like you’ve reached the end of your feed...'
}

export default memo(EndOfLineup)
