import { ChangeEvent, useCallback } from 'react'

import { accountSelectors } from '@audius/common'
import { IconInfo, RadioButton, RadioButtonGroup } from '@audius/stems'
import cn from 'classnames'
import { useField } from 'formik'
import { useSelector } from 'react-redux'

import Tooltip from 'components/tooltip/Tooltip'

import {
  AccessAndSaleFormValues,
  PREMIUM_CONDITIONS
} from '../AccessAndSaleField'

import styles from './SpecialAccessFields.module.css'

const { getUserId } = accountSelectors

const messages = {
  followersOnly: 'Available to Followers Only',
  supportersOnly: 'Available to Supporters Only',
  supportersInfo: 'Supporters are users who have sent you a tip.'
}

export enum SpecialAccessType {
  TIP = 'tip',
  FOLLOW = 'follow'
}

type TrackAvailabilityFieldsProps = {
  disabled?: boolean
}

const SPECIAL_ACCESS_TYPE = 'special_access_type'

export const SpecialAccessFields = (props: TrackAvailabilityFieldsProps) => {
  const { disabled } = props
  const accountUserId = useSelector(getUserId)
  const [specialAccessTypeField] = useField({
    name: SPECIAL_ACCESS_TYPE
  })

  const [, , { setValue: setPremiumConditionsValue }] =
    useField<AccessAndSaleFormValues[typeof PREMIUM_CONDITIONS]>(
      PREMIUM_CONDITIONS
    )

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const type = e.target.value as SpecialAccessType
      if (accountUserId) {
        if (type === SpecialAccessType.FOLLOW) {
          setPremiumConditionsValue({ follow_user_id: accountUserId })
        } else if (type === SpecialAccessType.TIP) {
          setPremiumConditionsValue({ tip_user_id: accountUserId })
        }
      }
      specialAccessTypeField.onChange(e)
    },
    [accountUserId, setPremiumConditionsValue, specialAccessTypeField]
  )

  return (
    <RadioButtonGroup
      className={styles.root}
      {...specialAccessTypeField}
      onChange={handleChange}
      defaultValue={SpecialAccessType.FOLLOW}
    >
      <label className={cn(styles.row, { [styles.disabled]: disabled })}>
        <RadioButton
          className={styles.radio}
          value={SpecialAccessType.FOLLOW}
          disabled={disabled}
        />
        <span>{messages.followersOnly}</span>
      </label>
      <label className={cn(styles.row, { [styles.disabled]: disabled })}>
        <RadioButton
          className={styles.radio}
          value={SpecialAccessType.TIP}
          disabled={disabled}
        />
        <span>{messages.supportersOnly}</span>
        <Tooltip
          className={styles.tooltip}
          text={messages.supportersInfo}
          mouseEnterDelay={0.1}
          mount={'parent'}
          color='--secondary'
        >
          <IconInfo className={styles.icon} />
        </Tooltip>
      </label>
    </RadioButtonGroup>
  )
}
