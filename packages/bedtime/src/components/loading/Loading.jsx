import { h } from 'preact'

import styles from './Loading.module.css'

import Spinner from '../spinner/Spinner'

const Loading = () => {
  return (
    <div className={styles.container}>
      <Spinner />
    </div>
  )
}

export default Loading
