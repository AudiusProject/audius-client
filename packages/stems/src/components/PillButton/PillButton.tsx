import cn from 'classnames'

import { Button, Type as ButtonType } from 'components/Button'

import styles from './PillButton.module.css'
import { PillButtonProps, Type as PillButtonType } from './types'

const TYPE_STYLE_MAP = {
  [PillButtonType.PRIMARY]: styles.primary,
  [PillButtonType.SECONDARY]: styles.secondary
}
export const PillButton = (props: PillButtonProps) => {
  const {
    text,
    onClick,
    type = PillButtonType.PRIMARY,
    className,
    textClassName
  } = props
  return (
    <Button
      className={cn(styles.button, TYPE_STYLE_MAP[type], className)}
      textClassName={cn(styles.buttonText, textClassName)}
      type={ButtonType.COMMON}
      text={text}
      onClick={onClick}
    />
  )
}
