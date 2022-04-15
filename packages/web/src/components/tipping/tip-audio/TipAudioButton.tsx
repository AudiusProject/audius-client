import React, { useCallback } from 'react'

import { Button, ButtonType } from '@audius/stems'
import { useDispatch } from 'react-redux'

import { ReactComponent as IconGoldBadgeSVG } from 'assets/img/IconGoldBadge.svg'
import { setSendStatus } from 'common/store/tipping/slice'

import styles from './TipAudio.module.css'

const messages = {
  tipAudio: 'Tip $AUDIO'
}

export const TipAudioButton = () => {
  const dispatch = useDispatch()

  const handleClick = useCallback(() => {
    dispatch(setSendStatus({ status: 'SEND' }))
  }, [dispatch])

  return (
    <Button
      type={ButtonType.PRIMARY}
      text={
        <div className={styles.tipIconTextContainer}>
          <IconGoldBadgeSVG width={24} height={24} />
          <span className={styles.tipText}>{messages.tipAudio}</span>
        </div>
      }
      onClick={handleClick}
    />
  )
}
