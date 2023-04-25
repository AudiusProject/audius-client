import { IconKebabHorizontal, IconButton, IconButtonProps } from '@audius/stems'
import { SetOptional } from 'type-fest'

import styles from './EditPlaylistNavItemButton.module.css'

type EditNavItemButtonProps = SetOptional<IconButtonProps, 'icon'>

export const EditNavItemButton = (props: EditNavItemButtonProps) => {
  return (
    <IconButton
      className={styles.root}
      icon={<IconKebabHorizontal height={11} width={11} />}
      {...props}
    />
  )
}
