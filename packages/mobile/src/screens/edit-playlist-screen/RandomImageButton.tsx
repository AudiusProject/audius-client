import { useCallback } from 'react'

import { RandomImage } from '@audius/common'
import { useField } from 'formik'

import IconCamera from 'app/assets/images/iconCamera.svg'
import { TextButton } from 'app/components/core'
import { flexRowCentered, makeStyles } from 'app/styles'

const messages = {
  getRandomArt: 'Get Random Artwork'
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    ...flexRowCentered(),
    justifyContent: 'center',
    marginTop: spacing(2)
  }
}))

type RandomImageInputProps = {
  name: string
  onProcessing: (isProcessing: boolean) => void
}

export const RandomImageInput = (props: RandomImageInputProps) => {
  const styles = useStyles()
  const { name, onProcessing } = props
  const [, , { setValue }] = useField(name)

  const handlePress = useCallback(async () => {
    onProcessing(true)
    const blob = await RandomImage.get()
    if (blob) {
      const url = URL.createObjectURL(blob)
      setValue({
        url,
        file: { uri: url, name: 'Artwork', type: 'image/jpeg' },
        source: 'unsplash'
      })
      onProcessing(false)
    }
  }, [onProcessing, setValue])

  return (
    <TextButton
      variant='secondary'
      title={messages.getRandomArt}
      icon={IconCamera}
      iconPosition='left'
      onPress={handlePress}
      style={styles.root}
    />
  )
}
