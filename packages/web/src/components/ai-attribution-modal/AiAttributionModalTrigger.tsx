import { Button, ButtonType } from '@audius/stems'

import styles from './AiAttributionModalTrigger.module.css'

const messages = {
  aiAttribution: 'AI Attribution',
  hideRemixes: 'Hide Remixes on Track Page'
}

type AiAttributionModalTriggerProps = {
  onClick: () => void
  hideRemixes: boolean
  handleToggle: () => void
}

export const AiAttributionModalTrigger = (
  props: AiAttributionModalTriggerProps
) => {
  return (
    <Button
      type={ButtonType.COMMON_ALT}
      name='remixSettings'
      text={messages.aiAttribution}
      className={styles.trigger}
      {...props}
    />
  )
}
