import React, { MouseEventHandler } from 'react'

import { ReactComponent as IconTwitterBird } from 'assets/img/iconTwitterBird.svg'

import styles from './TwitterShareButton.module.css'

const messages = {
  share: 'Share'
}

type TwitterShareButtonProps = {
  onClick?: MouseEventHandler
}

// TODO: mark notificationAsRead() // potentially move this to tile?

export const TwitterShareButton = (props: TwitterShareButtonProps) => {
  const { onClick } = props

  return (
    <button className={styles.root} onClick={onClick}>
      <IconTwitterBird className={styles.icon} />
      {messages.share}
    </button>
  )
}
