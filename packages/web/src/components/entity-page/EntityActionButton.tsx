import { Button, ButtonProps } from '@audius/stems'

import styles from './EntityActionButton.module.css'

type EntityActionButtonProps = ButtonProps

export const EntityActionButton = (props: EntityActionButtonProps) => {
  return (
    <Button
      textClassName={styles.text}
      iconClassName={styles.icon}
      {...props}
    />
  )
}
