import { createElement, useCallback } from 'react'

import type { Collection, CommonState, ID } from '@audius/common'
import { cacheCollectionsSelectors, SquareSizes } from '@audius/common'
import type { StyleProp, ViewStyle } from 'react-native'
import { useSelector } from 'react-redux'

import { Card } from 'app/components/card'
import { CollectionImage } from 'app/components/image/CollectionImage'
import { useNavigation } from 'app/hooks/useNavigation'
import { formatCount } from 'app/utils/format'

import type { ImageProps } from '../image/FastImage'

const { getCollection } = cacheCollectionsSelectors

const formatPlaylistCardSecondaryText = (saves: number, tracks: number) => {
  const savesText = saves === 1 ? 'Favorite' : 'Favorites'
  const tracksText = tracks === 1 ? 'Track' : 'Tracks'
  return `${formatCount(saves)} ${savesText} • ${tracks} ${tracksText}`
}

type FullCollectionCardProps = {
  collection: Collection
  style?: StyleProp<ViewStyle>
  /** Override for what number to show as the # of tracks. Optional. */
  numTracks?: number
}

type CollectionCardWithIdProps = {
  collectionId: ID
  style?: StyleProp<ViewStyle>
}

type CollectionCardProps = FullCollectionCardProps | CollectionCardWithIdProps

const FullCollectionCard = ({
  collection,
  numTracks,
  style
}: FullCollectionCardProps) => {
  const navigation = useNavigation()
  const handlePress = useCallback(() => {
    navigation.push('Collection', { id: collection.playlist_id })
  }, [navigation, collection])

  const renderImage = useCallback(
    (props: ImageProps) => (
      <CollectionImage
        collection={collection}
        size={SquareSizes.SIZE_480_BY_480}
        {...props}
      />
    ),
    [collection]
  )

  return (
    <Card
      style={style}
      renderImage={renderImage}
      type='collection'
      id={collection.playlist_id}
      primaryText={collection.playlist_name}
      secondaryText={formatPlaylistCardSecondaryText(
        collection.save_count,
        numTracks ?? collection.playlist_contents.track_ids.length
      )}
      onPress={handlePress}
    />
  )
}

const CollectionCardWithId = ({
  collectionId,
  style
}: CollectionCardWithIdProps) => {
  const collection = useSelector((state: CommonState) =>
    getCollection(state, { id: collectionId })
  )
  return collection ? (
    <FullCollectionCard collection={collection} style={style} />
  ) : null
}

function isCollectionCardWithIdProps(
  props: CollectionCardProps
): props is CollectionCardWithIdProps {
  return (props as CollectionCardWithIdProps).collectionId !== undefined
}

export const CollectionCard = (props: CollectionCardProps) => {
  return isCollectionCardWithIdProps(props)
    ? createElement(CollectionCardWithId, props)
    : createElement(FullCollectionCard, props)
}
