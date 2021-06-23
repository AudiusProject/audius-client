import React, { useContext } from 'react'

import { Link } from 'react-router-dom'
import { ToastContext } from '../ToastContext'

import styles from './LinkToastContent.module.css'

type LinkToastContentProps = {
  link: string
  linkText: string
  text: string
}

const LinkToastContent = ({ link, text }: LinkToastContentProps) => {
  const { clear: clearToasts } = useContext(ToastContext)

  return (
    <div>
      <span className={styles.text}>{text}</span>
      <Link to={link} className={styles.link} onClick={clearToasts}>
        View
      </Link>
    </div>
  )
}

export default LinkToastContent
