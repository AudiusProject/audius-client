import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Lottie from 'react-lottie'
import cn from 'classnames'

import styles from '../PlayBarButton.module.css'

const RepeatStates = Object.freeze({
  OFF: 0,
  ANIMATE_OFF_ALL: 1,
  ALL: 2,
  ANIMATE_ALL_SINGLE: 3,
  SINGLE: 4,
  ANIMATE_SINGLE_OFF: 5
})

class RepeatButton extends Component {
  constructor(props) {
    super(props)
    this.state = {
      repeatState: RepeatStates.OFF,
      isPaused: true,
      icon: props.animations ? props.animations.pbIconRepeatAll : null
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.animations !== this.props.animations) {
      this.handleChange(this.state.repeatState)
    }
  }

  handleChange = repeatState => {
    const {
      pbIconRepeatAll,
      pbIconRepeatSingle,
      pbIconRepeatOff
    } = this.props.animations
    // Go to the next state.
    let icon, isPaused
    switch (repeatState) {
      case RepeatStates.OFF:
        this.props.repeatOff()
        icon = pbIconRepeatAll
        isPaused = true
        break
      case RepeatStates.ANIMATE_OFF_ALL:
        icon = pbIconRepeatAll
        isPaused = false
        break
      case RepeatStates.ALL:
        this.props.repeatAll()
        icon = pbIconRepeatSingle
        isPaused = true
        break
      case RepeatStates.ANIMATE_ALL_SINGLE:
        icon = pbIconRepeatSingle
        isPaused = false
        break
      case RepeatStates.SINGLE:
        this.props.repeatSingle()
        icon = pbIconRepeatOff
        isPaused = true
        break
      case RepeatStates.ANIMATE_SINGLE_OFF:
        icon = pbIconRepeatOff
        isPaused = false
        break
      // Should never fire.
      default:
        icon = pbIconRepeatAll
        isPaused = true
    }
    this.setState({
      icon,
      isPaused,
      repeatState
    })
  }

  nextState = () => {
    const repeatState =
      (this.state.repeatState + 1) % Object.keys(RepeatStates).length
    this.handleChange(repeatState)
  }

  render() {
    // Listen for completion and bump the state again.
    const eventListeners = [
      {
        eventName: 'complete',
        callback: () => this.nextState()
      }
    ]
    const animationOptions = {
      loop: false,
      autoplay: false,
      animationData: this.state.icon
    }

    return (
      <button
        className={cn(styles.button, {
          [styles.buttonFixedSize]: this.props.isMobile,
          [styles.repeat]: this.props.isMobile
        })}
        onClick={this.nextState}
      >
        <Lottie
          options={animationOptions}
          eventListeners={eventListeners}
          isPaused={this.state.isPaused}
        />
      </button>
    )
  }
}

RepeatButton.propTypes = {
  animations: PropTypes.object,
  repeatOff: PropTypes.func,
  repeatSingle: PropTypes.func,
  repeatAll: PropTypes.func,
  isMobile: PropTypes.bool
}

RepeatButton.defaultProps = {
  repeatOff: () => {},
  repeatSingle: () => {},
  repeatAll: () => {}
}

export default RepeatButton
