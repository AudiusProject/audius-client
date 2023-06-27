import { h } from 'preact'

import { useState, useEffect } from 'preact/hooks'
import styles from './Loading.module.css'

import Spinner from '../spinner/Spinner'
import cn from 'classnames'

const Loading = () => {
  // There's some strange issue
  // where the loading spinner loads in the wrong
  // place if it's rendered on app mount.
  // So we mount it with a slight delay.
  const [shouldRender, setShouldRender] =  useState(false)
  useEffect(() => {
    setTimeout(() => {
      setShouldRender(true)
    }, 10)
  }, [])

  // Do a little opacity transition
  const [didLoad, setDidLoad] = useState(false)
  useEffect(() => {
    if (shouldRender) setDidLoad(true)
  }, [setDidLoad, shouldRender])

  if (!shouldRender) return null

  return (
    <div className={cn(styles.container, { [styles.didLoad]: didLoad })}>
      <Spinner />
    </div>
  )
}

export default Loading
