import { useCallback } from 'react'

import { useSelector } from 'react-redux'

import { ID } from 'models/Identifiers'
import { useAppContext } from 'src/context'
import {
  getCollection,
  getCollectionTracks
} from 'store/cache/collections/selectors'
import { CommonState } from 'store/index'
import { updatePlaylistArtwork } from 'utils/updatePlaylistArtwork'

export const useGeneratePlaylistArtwork = (collectionId: ID) => {
  const collection = useSelector((state: CommonState) =>
    getCollection(state, { id: collectionId })
  )

  const collectionTracks = useSelector((state: CommonState) =>
    getCollectionTracks(state, { id: collectionId })
  )

  const { imageUtils, audiusBackend } = useAppContext()

  return useCallback(async () => {
    if (!collection || !collectionTracks) return null
    const { artwork } = await updatePlaylistArtwork(
      collection,
      collectionTracks,
      { regenerate: true },
      { audiusBackend, generateImage: imageUtils.generatePlaylistArtwork }
    )
    if (!artwork) return null
    const { url, file } = artwork
    if (!url) return null
    return { url, file }
  }, [
    collection,
    collectionTracks,
    audiusBackend,
    imageUtils.generatePlaylistArtwork
  ])
}
