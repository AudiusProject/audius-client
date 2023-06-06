import { createElement, useCallback, useMemo } from 'react'

import type { Collection, CommonState, ID } from '@audius/common'
import {
  SquareSizes,
  cacheCollectionsSelectors,
  reachabilitySelectors
} from '@audius/common'
import type { StyleProp, ViewStyle } from 'react-native'
import { useSelector } from 'react-redux'

import { Card } from 'app/components/card'
import { CollectionImage } from 'app/components/image/CollectionImage'
import { useNavigation } from 'app/hooks/useNavigation'
import { useOfflineTracksStatus } from 'app/hooks/useOfflineTrackStatus'
import { OfflineDownloadStatus } from 'app/store/offline-downloads/slice'
import { formatCount } from 'app/utils/format'

import type { ImageProps } from '../image/FastImage'

const { getCollection } = cacheCollectionsSelectors
const { getIsReachable } = reachabilitySelectors

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

/** Detects offline state and returns downloaded track count if appropriate */
const useTrackCountWithOfflineOverride = (collection: Collection | null) => {
  const isReachable = useSelector(getIsReachable)
  const offlineTrackStatus = useOfflineTracksStatus({ skipIfOnline: true })

  return useMemo(() => {
    if (!collection) {
      return 0
    }
    if (!isReachable) {
      return collection.playlist_contents.track_ids.length
    }
    const trackIds =
      collection.playlist_contents?.track_ids?.map(
        (trackData) => trackData.track
      ) ?? []
    return trackIds.filter(
      (trackId) =>
        offlineTrackStatus[trackId.toString()] === OfflineDownloadStatus.SUCCESS
    ).length
  }, [collection, isReachable, offlineTrackStatus])
}

const CollectionCardWithId = ({
  collectionId,
  style
}: CollectionCardWithIdProps) => {
  const collection = useSelector((state: CommonState) =>
    getCollection(state, { id: collectionId })
  )

  const numTracks = useTrackCountWithOfflineOverride(collection)
  return collection ? (
    <FullCollectionCard
      collection={collection}
      numTracks={numTracks}
      style={style}
    />
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
