import { PropsWithChildren } from 'react'

import { Switch } from '@audius/stems'
import cn from 'classnames'
import { useField } from 'formik'

import styles from './ToggleRowField.module.css'

type ToggleFieldProps = PropsWithChildren & {
  name: string
  header: string
  description: string
}

export const ToggleRowField = (props: ToggleFieldProps) => {
  const { name, header, description, children } = props
  const [{ value }, , { setValue }] = useField<boolean>(name)

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <h3 className={cn(styles.title, styles.modalHeading)}>{header}</h3>
        <p className={styles.description}>{description}</p>
        {value ? children : null}
      </div>
      <Switch
        // TODO: default value with inner form
        checked={value}
        onChange={() => {
          setValue(!value)
        }}
      />
    </div>
  )
}
