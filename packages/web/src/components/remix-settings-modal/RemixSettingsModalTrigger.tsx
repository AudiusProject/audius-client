import { FeatureFlags } from '@audius/common'
import { ButtonType } from '@audius/stems'

import LabeledButton from 'components/labeled-button/LabeledButton'
import Switch from 'components/switch/Switch'
import { useFlag } from 'hooks/useRemoteConfig'

import styles from './RemixSettingsModalTrigger.module.css'

const messages = {
  remixSettings: 'Remix Settings',
  hideRemixes: 'Hide Remixes on Track Page'
}

type RemixSettingsModalTriggerProps = {
  onClick: () => void
  hideRemixes: boolean
  didToggleHideRemixesState: () => void
}

export const RemixSettingsModalTrigger = (
  props: RemixSettingsModalTriggerProps
) => {
  const { isEnabled: isPremiumContentEnabled } = useFlag(
    FeatureFlags.PREMIUM_CONTENT_ENABLED
  )

  if (isPremiumContentEnabled) {
    return (
      <LabeledButton
        type={ButtonType.COMMON_ALT}
        name='remixSettings'
        label=''
        text={messages.remixSettings}
        className={styles.trigger}
        textClassName={styles.triggerText}
        onClick={props.onClick}
      />
    )
  }

  return (
    <div className={styles.hideRemixes}>
      <div className={styles.hideRemixesText}>{messages.hideRemixes}</div>
      <Switch
        isOn={props.hideRemixes}
        handleToggle={props.didToggleHideRemixesState}
      />
    </div>
  )
}
