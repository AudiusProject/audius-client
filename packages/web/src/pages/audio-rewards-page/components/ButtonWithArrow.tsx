import { Button, ButtonProps, ButtonType, IconArrow } from '@audius/stems'
import cn from 'classnames'

import styles from './ButtonWithArrow.module.css'

const ButtonWithArrow = (
  props: { hasDisbursed: boolean; needsDisbursement?: boolean } & ButtonProps
) => {
  const buttonType = props.needsDisbursement
    ? ButtonType.PRIMARY_ALT
    : props.hasDisbursed
    ? ButtonType.COMMON_ALT
    : ButtonType.COMMON
  return (
    <Button
      className={cn(styles.rewardButton, props.className)}
      type={buttonType}
      rightIcon={props.hasDisbursed ? null : <IconArrow />}
      iconClassName={styles.buttonIcon}
      textClassName={cn(styles.text, props.textClassName)}
      {...props}
    />
  )
}

export default ButtonWithArrow
