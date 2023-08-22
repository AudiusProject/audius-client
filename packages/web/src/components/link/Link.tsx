import { useCallback, MouseEvent } from 'react'

import cn from 'classnames'
import { Link as LinkBase, LinkProps as LinkBaseProps } from 'react-router-dom'

import { Text } from 'components/typography'
import { TextProps } from 'components/typography/Text'

import styles from './Link.module.css'

export type LinkProps = LinkBaseProps<'a'> &
  TextProps<'a'> & {
    stopPropagation?: boolean
  }

export const Link = (props: LinkProps) => {
  const { className, onClick, stopPropagation = true, ...other } = props

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e)
      if (stopPropagation) {
        e.stopPropagation()
      }
    },
    [onClick, stopPropagation]
  )

  return (
    <Text
      as={LinkBase}
      className={cn(styles.root, className)}
      onClick={handleClick}
      {...other}
    />
  )
}
