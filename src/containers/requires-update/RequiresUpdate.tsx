import React from 'react'
import Spin from 'antd/lib/spin'
import { Button, ButtonType, ButtonSize } from '@audius/stems'

import tileBackground from 'assets/img/notFoundTiledBackround.png'
import styles from './RequiresUpdate.module.css'
import Theme from 'models/Theme'
import { shouldShowDark } from 'utils/theme/theme'

const messages = {
  title: 'Please Update ✨',
  subtitle: "The version of Audius you're running is too far behind.",
  buttonUpdate: 'UPDATE NOW',
  buttonIsUpdating: 'UPDATING'
}

type SomethingWrongProps = {
  isUpdating: boolean
  theme: Theme
  onUpdate: () => void
}

const SomethingWrong = ({
  isUpdating,
  onUpdate,
  theme
}: SomethingWrongProps) => (
  <div className={styles.requiresUpdate}>
    <div
      className={styles.content}
      style={{
        backgroundImage: `url(${tileBackground})`,
        backgroundBlendMode: shouldShowDark(theme) ? 'color-burn' : 'none'
      }}
    >
      <div className={styles.title}>{messages.title}</div>
      <div className={styles.subtitle}>{messages.subtitle}</div>
      <div className={styles.button}>
        <Button
          type={ButtonType.PRIMARY_ALT}
          rightIcon={
            isUpdating ? <Spin className={styles.spinner} /> : undefined
          }
          text={isUpdating ? messages.buttonIsUpdating : messages.buttonUpdate}
          size={ButtonSize.MEDIUM}
          onClick={onUpdate}
        />
      </div>
    </div>
  </div>
)

export default SomethingWrong
