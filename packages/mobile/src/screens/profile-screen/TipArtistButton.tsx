import { useCallback } from 'react'

import { beginTip } from 'audius-client/src/common/store/tipping/slice'

import IconGoldBadge from 'app/assets/images/IconGoldBadge.svg'
import { Button } from 'app/components/core'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useNavigation } from 'app/hooks/useNavigation'
import { makeStyles } from 'app/styles'

import { useSelectProfile } from './selectors'

const messages = {
  title: 'Tip $AUDIO',
  label: 'Tip Audio tokens'
}

const useStyles = makeStyles(() => ({
  text: {
    fontSize: 16
  }
}))

export const TipArtistButton = () => {
  const navigation = useNavigation()
  const profile = useSelectProfile(['user_id'])
  const dispatchWeb = useDispatchWeb()

  const handlePress = useCallback(() => {
    dispatchWeb(beginTip({ user: profile, source: 'profile' }))
    navigation.navigate({ native: { screen: 'TipArtist' } })
  }, [dispatchWeb, profile, navigation])

  const styles = useStyles()

  return (
    <Button
      variant='primary'
      accessibilityLabel={messages.label}
      title={messages.title}
      icon={IconGoldBadge}
      iconPosition='left'
      fullWidth
      onPress={handlePress}
      styles={{
        text: styles.text
      }}
    />
  )
}
