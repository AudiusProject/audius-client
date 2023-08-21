// link that renders an anchor tag, but is not clickable itself
import { MouseEvent, forwardRef, useCallback } from 'react'

import cn from 'classnames'
import { LinkProps } from 'react-router-dom'

import styles from './SeoLink.module.css'

type SeoLinkProps = Omit<LinkProps, 'to'> & { to: string }

export const SeoLink = forwardRef<HTMLAnchorElement, SeoLinkProps>(
  function SeoLink(props, ref) {
    const { className, to, onClick, ...other } = props

    const handleClick = useCallback(
      (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()
        onClick?.(event)
      },
      [onClick]
    )

    return (
      <a
        ref={ref}
        className={cn(styles.root, className)}
        href={to}
        onClick={handleClick}
        {...other}
      />
    )
  }
)
