import cn from 'classnames'

import { ReactComponent as IconTwitter } from 'assets/img/iconTwitterBird.svg'

import { SocialButton, SocialButtonProps } from '../SocialButton'

import styles from './TwitterButton.module.css'

export type TwitterButtonProps = SocialButtonProps & {
  isMobile?: boolean
  size?: 'tiny' | 'small' | 'medium' | 'large'
}

export const TwitterButton = (props: TwitterButtonProps) => {
  const {
    className,
    iconClassName,
    isMobile,
    onClick,
    size = 'medium',
    text,
    textClassName
  } = props

  // TODO: check/improve verified state
  const buttonClassNames = cn(className, styles.button, styles.twitter, {
    [styles.verified]: text === 'Verified',
    [styles.notVerified]: text !== 'Verified',
    [styles.isMobile]: isMobile,
    [styles.large]: size === 'large',
    [styles.medium]: size === 'medium',
    [styles.small]: size === 'small',
    [styles.tiny]: size === 'tiny'
  })

  return (
    <SocialButton
      className={buttonClassNames}
      iconClassName={iconClassName}
      leftIcon={<IconTwitter />}
      onClick={onClick}
      text={text}
      textClassName={cn(styles.textLabel, textClassName)}
    />
  )
}
