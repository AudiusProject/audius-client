import { MouseEvent, useCallback } from 'react'

import cn from 'classnames'
import { Link, LinkProps } from 'react-router-dom'

import styles from './Tag.module.css'

export type TagProps = Omit<LinkProps, 'onClick'> & {
  textLabel: string
  onClick?: (e: MouseEvent, value: string) => void
}

export const Tag = (props: TagProps) => {
  const { textLabel, className, onClick, ...linkProps } = props

  const style = {
    [styles.clickable]: !!onClick
  }

  const handleClick = useCallback(
    (e: MouseEvent) => {
      onClick?.(e, textLabel)
    },
    [onClick, textLabel]
  )

  return (
    <Link
      className={cn(className, styles.tag, style)}
      onClick={handleClick}
      {...linkProps}
    >
      <span className={styles.textLabel}>{textLabel}</span>
    </Link>
  )
}
