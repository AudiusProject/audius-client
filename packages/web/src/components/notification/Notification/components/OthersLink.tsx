import { MouseEventHandler } from 'react'

import { formatCount } from 'common/utils/formatUtil'

import styles from './OthersLink.module.css'

const messages = {
  and: 'and',
  others: (othersCount: number) =>
    `${formatCount(othersCount)} other${othersCount > 1 ? 's' : ''}`
}
type OthersLinkProps = {
  othersCount: number
  onClick: MouseEventHandler
}

export const OthersLink = (props: OthersLinkProps) => {
  const { othersCount, onClick } = props

  return (
    <span className={styles.root}>
      {messages.and}{' '}
      <span className={styles.link} onClick={onClick} role='button'>
        {messages.others(othersCount)}
      </span>
    </span>
  )
}
