import { ComponentProps } from 'react'

import cn from 'classnames'

import styles from './NotificationDot.module.css'

type NotificationDotVariant = 'small' | 'large'
type NotificationDotProps = {
  variant: NotificationDotVariant
} & ComponentProps<'span'>

/** Renders a basic notification dot used to decorate controls and indicate new information */
export const NotificationDot = (props: NotificationDotProps) => {
  const { variant, className, ...other } = props

  const sizeClass = variant === 'small' ? styles.small : styles.large

  return (
    <span
      {...other}
      className={cn(styles.notificationDot, sizeClass, className)}
    />
  )
}
