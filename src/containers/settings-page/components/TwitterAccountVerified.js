import React, { Component } from 'react'
import cn from 'classnames'
import PropTypes from 'prop-types'
import styles from './TwitterAccountVerified.module.css'
import TwitterAuthButton from 'components/general/TwitterAuthButton'

const messages = {
  verify: 'Verify with Twitter'
}

export class AccountVerified extends Component {
  onTwitterLoginSuccess = async twitterProfile => {
    const { uuid, profile } = await twitterProfile.json()
    this.props.onSuccess(uuid, profile)
    this.props.onTwitterCompleteOauth(profile.verified)
    if (!profile.verified) {
      this.onTwitterLoginFailure()
    }
  }

  onTwitterLoginFailure = () => {
    if (this.props.onFailure) {
      this.props.onFailure()
    }
  }

  render() {
    const { isVerified, isMobile, onClick, className } = this.props
    return (
      <TwitterAuthButton
        isMobile={isMobile}
        className={cn(styles.twitterButton, { [className]: !!className })}
        textClassName={styles.text}
        iconClassName={styles.icon}
        textLabel={messages.verify}
        disabled={isVerified}
        onClick={onClick}
        onSuccess={this.onTwitterLoginSuccess}
        onFailure={this.onTwitterLoginFailure}
      />
    )
  }
}

AccountVerified.propTypes = {
  isVerified: PropTypes.bool,
  onTwitterCompleteOauth: PropTypes.func,
  onClick: PropTypes.func,
  onSuccess: PropTypes.func,
  isMobile: PropTypes.bool
}

AccountVerified.defaultProps = {
  isVerified: false
}

export default AccountVerified
