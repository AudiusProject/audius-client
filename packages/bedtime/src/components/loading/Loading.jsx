import { h } from 'preact'

import { useState, useEffect } from 'preact/hooks'
import styles from './Loading.module.css'

import Spinner from '../spinner/Spinner'
import cn from 'classnames'

const Loading = () => {
  // Do a little opacity animation
  const [didLoad, setDidLoad] = useState(false)
  useEffect(() => {
    setDidLoad(true)
  })

  return (
    <div className={cn(styles.container, { [styles.didLoad]: didLoad })}>
      <Spinner />
    </div>
  )
}

export default Loading
