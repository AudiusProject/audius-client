import { IconButton, IconKebabHorizontal } from '@audius/stems'

import styles from './DeveloperApps.module.css'

const messages = {
  appActionsLabel: 'developer app actions'
}

type DeveloperAppListItemProps = {
  index: number
  appName: string
}

export const DeveloperAppListItem = (props: DeveloperAppListItemProps) => {
  const { index, appName } = props

  const divider = <hr className={styles.listItemDivider} />

  return (
    <li className={styles.listItem}>
      <span className={styles.listItemIndex}>{index}</span>
      {divider}
      <span className={styles.listItemAppName}>{appName}</span>
      {divider}
      <IconButton
        className={styles.listItemActions}
        aria-label={messages.appActionsLabel}
        icon={<IconKebabHorizontal />}
        onClick={() => console.log('hello world')}
      />
    </li>
  )
}
