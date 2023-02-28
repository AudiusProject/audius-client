import { useCallback } from 'react'

import type { User } from '@audius/common'
import { chatActions } from '@audius/common'
import { useDispatch } from 'react-redux'

import IconMessage from 'app/assets/images/iconMessage.svg'
import { Button } from 'app/components/core'
import { makeStyles } from 'app/styles'

const { createChat } = chatActions

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    paddingHorizontal: 0,
    height: spacing(8),
    width: spacing(8),
    marginRight: spacing(2)
  }
}))

type MessageButtonProps = {
  profile: Pick<User, 'user_id'>
}

export const MessageButton = (props: MessageButtonProps) => {
  const styles = useStyles()
  const { profile } = props
  const { user_id } = profile
  const dispatch = useDispatch()

  const handlePress = useCallback(() => {
    dispatch(createChat({ userIds: [user_id] }))
  }, [dispatch, user_id])

  return (
    <Button
      style={styles.root}
      noText
      icon={IconMessage}
      variant={'common'}
      size='small'
      onPress={handlePress}
    />
  )
}
