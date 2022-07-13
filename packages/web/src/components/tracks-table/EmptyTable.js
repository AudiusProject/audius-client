import { Button, ButtonType } from '@audius/stems'
import PropTypes from 'prop-types'

import styles from './EmptyTable.module.css'

const EmptyTable = (props) => {
  return (
    <div className={styles.emptySectionContainer}>
      <div className={styles.emptySectionText}>
        <div>
          {props.primaryText} <i className='emoji face-with-monocle' />
        </div>
        <div>{props.secondaryText}</div>
      </div>
      <Button
        className={styles.startListeningButton}
        type={ButtonType.SECONDARY}
        text={props.buttonLabel}
        onClick={props.onClick}
      />
    </div>
  )
}

EmptyTable.propTypes = {
  primaryText: PropTypes.string,
  secondaryText: PropTypes.string,
  buttonLabel: PropTypes.string,
  onClick: PropTypes.func
}

EmptyTable.defaultProps = {
  primaryText: '',
  secondaryText: '',
  buttonLabel: '',
  onClick: () => {}
}

export default EmptyTable
