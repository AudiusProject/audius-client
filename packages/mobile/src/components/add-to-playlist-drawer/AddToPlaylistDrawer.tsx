import { useCallback } from 'react'

import type { Collection } from '@audius/common'
import {
  SquareSizes,
  CreatePlaylistSource,
  accountSelectors,
  cacheCollectionsActions,
  addToPlaylistUISelectors,
  FeatureFlags
} from '@audius/common'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import Button, { ButtonType } from 'app/components/button'
import { Card } from 'app/components/card'
import { AppDrawer, useDrawerState } from 'app/components/drawer'
import { CollectionImage } from 'app/components/image/CollectionImage'
import { useFeatureFlag } from 'app/hooks/useRemoteConfig'
import { useToast } from 'app/hooks/useToast'
import { makeStyles, shadow } from 'app/styles'

import { CollectionList } from '../collection-list'
import { AddCollectionCard } from '../collection-list/AddCollectionCard'
import type { ImageProps } from '../image/FastImage'

const { addTrackToPlaylist, createPlaylist } = cacheCollectionsActions
const { getTrackId, getTrackTitle, getTrackIsUnlisted } =
  addToPlaylistUISelectors
const { getAccountWithOwnPlaylists } = accountSelectors

const messages = {
  title: 'Add To Playlist',
  addedToast: 'Added To Playlist!',
  hiddenAdd: 'You cannot add hidden tracks to a public playlist.'
}

const useStyles = makeStyles(() => ({
  buttonContainer: {
    alignSelf: 'center',
    borderRadius: 4,
    marginBottom: 16,
    ...shadow()
  },
  button: {
    width: 256
  },
  cardList: {
    paddingBottom: 240
  }
}))

export const AddToPlaylistDrawer = () => {
  const styles = useStyles()
  const { toast } = useToast()
  const dispatch = useDispatch()
  const { onClose } = useDrawerState('AddToPlaylist')
  const trackId = useSelector(getTrackId)
  const trackTitle = useSelector(getTrackTitle)
  const isTrackUnlisted = useSelector(getTrackIsUnlisted)
  const user = useSelector(getAccountWithOwnPlaylists)
  const { isEnabled: isPlaylistUpdatesEnabled } = useFeatureFlag(
    FeatureFlags.PLAYLIST_UPDATES_PRE_QA
  )

  const renderImage = useCallback(
    (item) => (props?: ImageProps) =>
      (
        <CollectionImage
          collection={item}
          size={SquareSizes.SIZE_480_BY_480}
          {...props}
        />
      ),
    []
  )

  const userPlaylists = user?.playlists ?? []

  const addToNewPlaylist = useCallback(() => {
    const metadata = { playlist_name: trackTitle ?? 'New Playlist' }
    dispatch(
      createPlaylist(
        metadata,
        CreatePlaylistSource.FROM_TRACK,
        trackId,
        'toast'
      )
    )
    onClose()
  }, [dispatch, onClose, trackId, trackTitle])

  const renderCard = useCallback(
    ({ item }: { item: Collection | { _create: boolean } }) =>
      '_create' in item ? (
        <AddCollectionCard
          source={CreatePlaylistSource.FROM_TRACK}
          sourceTrackId={trackId}
          onCreate={addToNewPlaylist}
        />
      ) : (
        <Card
          style={{ opacity: isTrackUnlisted && !item.is_private ? 0.5 : 1 }}
          key={item.playlist_id}
          type='collection'
          id={item.playlist_id}
          primaryText={item.playlist_name}
          secondaryText={user?.name}
          onPress={() => {
            // Don't add if the track is hidden, but playlist is public
            if (isTrackUnlisted && !item.is_private) {
              toast({ content: messages.hiddenAdd })
              return
            }
            toast({ content: messages.addedToast })
            dispatch(addTrackToPlaylist(trackId!, item.playlist_id))
            onClose()
          }}
          renderImage={renderImage(item)}
        />
      ),
    [
      addToNewPlaylist,
      dispatch,
      isTrackUnlisted,
      onClose,
      renderImage,
      toast,
      trackId,
      user?.name
    ]
  )

  if (!user || !trackId || !trackTitle) {
    return null
  }

  return (
    <AppDrawer
      modalName='AddToPlaylist'
      isFullscreen
      isGestureSupported={false}
      title={messages.title}
    >
      <View>
        {!isPlaylistUpdatesEnabled ? (
          <View style={styles.buttonContainer}>
            <Button
              title='Create New Playlist'
              onPress={addToNewPlaylist}
              containerStyle={styles.button}
              type={ButtonType.COMMON}
            />
          </View>
        ) : null}
        <CollectionList
          contentContainerStyle={styles.cardList}
          collection={userPlaylists}
          showCreatePlaylistTile={isPlaylistUpdatesEnabled}
          renderItem={renderCard}
        />
      </View>
    </AppDrawer>
  )
}
