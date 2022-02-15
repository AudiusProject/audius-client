import { useCallback } from 'react'

import { useNavigation } from 'app/hooks/useNavigation'

import { Button } from './Button'

export const EditProfileButton = () => {
  const navigation = useNavigation()
  const handlePress = useCallback(() => {
    navigation.navigate({
      native: { screen: 'EditProfile', params: undefined }
    })
  }, [navigation])

  return (
    <Button title='Edit Profile' variant='secondary' onPress={handlePress} />
  )
}
