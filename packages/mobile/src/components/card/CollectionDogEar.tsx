import type { ID } from '@audius/common'
import { cacheCollectionsSelectors, DogEarType } from '@audius/common'
import { useSelector } from 'react-redux'

import { DogEar } from '../core'

const { getCollection } = cacheCollectionsSelectors

type CollectionDogEarProps = {
  collectionId: ID
}

export const CollectionDogEar = (props: CollectionDogEarProps) => {
  const { collectionId } = props

  const isPrivate = useSelector(
    (state) => getCollection(state, { id: collectionId })?.is_private
  )

  const dogEarType = isPrivate ? DogEarType.HIDDEN : null

  if (dogEarType) {
    return <DogEar type={dogEarType} />
  }

  return null
}
