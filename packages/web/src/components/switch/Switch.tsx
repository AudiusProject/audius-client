import { ComponentPropsWithoutRef, ReactNode } from 'react'

import cn from 'classnames'

import styles from './Switch.module.css'

type SwitchProps = {
  isOn: boolean
  isDisabled?: boolean
  label?: string | ReactNode
  handleToggle: () => void
}

const Switch = ({
  className,
  isOn,
  handleToggle,
  isDisabled = false,
  label
}: SwitchProps & ComponentPropsWithoutRef<'div'>) => {
  return (
    <div
      className={cn(
        styles.container,
        { [styles.disabled]: isDisabled },
        className
      )}
    >
      <label className={styles.switchLabel}>
        <input
          checked={isDisabled ? false : isOn}
          className={styles.inputCheckbox}
          type='checkbox'
        />
        <span className={styles.switchButtonContainer} onClick={handleToggle}>
          <span className={styles.switchButton} />
        </span>
        <span className={styles.switchLabelText} onClick={handleToggle}>
          {label}
        </span>
      </label>
    </div>
  )
}

export default Switch
