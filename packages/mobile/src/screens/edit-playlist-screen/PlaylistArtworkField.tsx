import { useCallback } from 'react'

import { useGeneratePlaylistArtwork } from '@audius/common'
import { useField, useFormikContext } from 'formik'

import { PickArtworkField } from 'app/components/fields'

const messages = {
  removeArtwork: 'Remove Artwork',
  removingArtwork: 'Removing Artwork',
  updatingArtwork: 'Updating Artwork'
}

type PickArtworkFieldProps = {
  name: string
}

export const PlaylistArtworkField = (props: PickArtworkFieldProps) => {
  const { name } = props
  const [{ value: artworkUrl }, , { setValue: setArtwork }] = useField(name)
  const [{ value: collectionId }] = useField('playlist_id')
  const [{ value: isImageAutogenerated }, , { setValue: setIsAutogenerated }] =
    useField('is_image_autogenerated')
  const generatePlaylistArtwork = useGeneratePlaylistArtwork(collectionId)
  const { status, setStatus } = useFormikContext()

  const handleChange = useCallback(() => {
    setIsAutogenerated(false)
  }, [setIsAutogenerated])

  const handleRemove = useCallback(async () => {
    setStatus({ imageGenerating: true })
    const { file, url } = await generatePlaylistArtwork()
    setArtwork({ url, file })
    setIsAutogenerated(true)
  }, [setStatus, generatePlaylistArtwork, setArtwork, setIsAutogenerated])

  const handleImageLoad = useCallback(() => {
    setStatus({ imageGenerating: false })
  }, [setStatus])

  return (
    <PickArtworkField
      {...props}
      onPress={artworkUrl && !isImageAutogenerated ? handleRemove : undefined}
      onChange={handleChange}
      buttonTitle={
        status.imageGenerating && isImageAutogenerated
          ? messages.updatingArtwork
          : artworkUrl && status.imageGenerating
          ? messages.removingArtwork
          : artworkUrl && !isImageAutogenerated
          ? messages.removeArtwork
          : undefined
      }
      onImageLoad={handleImageLoad}
      isLoading={status.imageGenerating}
    />
  )
}
