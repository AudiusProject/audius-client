import { useCallback } from 'react'

import { Button, ButtonType } from '@audius/stems'
import cn from 'classnames'
import { push as pushRoute } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import { ReactComponent as IconRobot } from 'assets/img/robot.svg'
import { profilePageAiAttributedTracks } from 'utils/route'

import styles from './AiGeneratedButton.module.css'

const messages = {
  aiGenerated: 'AI Generated'
}

export const AiGeneratedButton = ({ handle }: { handle: string }) => {
  const dispatch = useDispatch()

  const handleClick = useCallback(() => {
    dispatch(pushRoute(profilePageAiAttributedTracks(handle)))
  }, [dispatch, handle])

  return (
    <Button
      className={cn(styles.button, styles.aiGeneratedButton)}
      type={ButtonType.TERTIARY}
      leftIcon={<IconRobot />}
      text={
        <div className={styles.tipIconTextContainer}>
          {messages.aiGenerated}
        </div>
      }
      onClick={handleClick}
    />
  )
}
