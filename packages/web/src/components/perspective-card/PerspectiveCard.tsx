import { ReactNode } from 'react'

import cn from 'classnames'
import { animated } from 'react-spring'

import { ReactComponent as IconAudioRewardsPill } from 'assets/img/iconAudioRewardsPill.svg'
import useCardWeight from 'hooks/useCardWeight'

import styles from './PerspectiveCard.module.css'

type PerspectiveCardProps = {
  backgroundGradient?: string
  shadowColor?: string
  backgroundIcon?: ReactNode | JSX.Element
  children?: JSX.Element | JSX.Element[]
  className?: string
  isDisabled?: boolean
  useOverlayBlendMode?: boolean
  onClick?: () => void
  isIncentivized?: boolean
  sensitivity?: number
}

const PerspectiveCard = ({
  backgroundGradient,
  shadowColor,
  backgroundIcon,
  children,
  className,
  isDisabled,
  useOverlayBlendMode = true,
  onClick,
  sensitivity,
  isIncentivized = false
}: PerspectiveCardProps) => {
  const [cardRef, onMove, onLeave, transform] = useCardWeight({
    isDisabled,
    sensitivity
  })

  return (
    <div
      className={styles.moveContainer}
      ref={cardRef}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <animated.div
        className={styles.perspective}
        // @ts-ignore -- TODO figure out why react-spring transform type doesn't work here
        style={{ transform }}
      >
        <div
          className={cn(styles.perspectiveCard, className, {
            [styles.isDisabled]: isDisabled,
            [styles.overlay]: useOverlayBlendMode
          })}
          style={{
            boxShadow: `0 2px 8px -2px ${shadowColor}`,
            background: backgroundGradient
          }}
        >
          {isIncentivized ? (
            <div className={styles.rewardsPill}>
              <IconAudioRewardsPill />
            </div>
          ) : null}
          {children}
          <div className={styles.backgroundIcon}>{backgroundIcon}</div>
        </div>
      </animated.div>
    </div>
  )
}

export default PerspectiveCard

type TextInteriorProps = {
  title?: string
  subtitle?: string
}

export const TextInterior = ({ title, subtitle }: TextInteriorProps) => {
  return (
    <div className={styles.textInterior}>
      <div className={styles.title}>{title}</div>
      <div className={styles.subtitle}>{subtitle}</div>
    </div>
  )
}

type EmojiInteriorProps = {
  title?: string
  emoji?: string
}

export const EmojiInterior = ({ title, emoji }: EmojiInteriorProps) => {
  return (
    <div className={styles.emojiInterior}>
      <div className={styles.title}>{title}</div>
      <div className={styles.emoji}>
        <i className={`emoji xxl ${emoji}`} />
      </div>
    </div>
  )
}
