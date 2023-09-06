import { useCallback } from 'react'

import { SquareSizes } from '@audius/common'
import type { SearchPlaylist, SearchTrack, SearchUser } from '@audius/common'
import { View, Text } from 'react-native'
import { useDispatch } from 'react-redux'

import { CollectionImage } from 'app/components/image/CollectionImage'
import { TrackImage } from 'app/components/image/TrackImage'
import { UserImage } from 'app/components/image/UserImage'
import UserBadges from 'app/components/user-badges/UserBadges'
import { useNavigation } from 'app/hooks/useNavigation'
import { addItem } from 'app/store/search/searchSlice'
import { makeStyles } from 'app/styles'

import { SearchResultItem } from './SearchResult'
import type { SectionHeader } from './SearchSectionHeader'

const useStyles = makeStyles(({ typography, palette, spacing }) => ({
  name: {
    ...typography.body,
    color: palette.neutral
  },
  userName: {
    ...typography.body,
    color: palette.neutralLight4
  },
  badgeContainer: {
    flex: 1
  },
  nameContainer: {
    flex: 1
  },
  userImage: {
    borderRadius: spacing(5),
    height: spacing(10),
    width: spacing(10)
  },
  squareImage: {
    borderRadius: spacing(1),
    height: spacing(10),
    width: spacing(10)
  }
}))

type UserSearchResultProps = { item: SearchUser }

const UserSearchResult = (props: UserSearchResultProps) => {
  const { item: user } = props
  const styles = useStyles()
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const handlePress = useCallback(() => {
    dispatch(addItem({ searchItem: user.name }))
    navigation.push('Profile', { handle: user.handle })
  }, [user, navigation, dispatch])

  return (
    <SearchResultItem onPress={handlePress}>
      <UserImage
        user={user}
        style={styles.userImage}
        size={SquareSizes.SIZE_150_BY_150}
      />
      <UserBadges
        style={styles.badgeContainer}
        nameStyle={styles.name}
        user={user}
      />
    </SearchResultItem>
  )
}

type TrackSearchResultProps = { item: SearchTrack }

const TrackSearchResult = (props: TrackSearchResultProps) => {
  const { item: track } = props
  const styles = useStyles()

  const navigation = useNavigation()
  const dispatch = useDispatch()

  const handlePress = useCallback(() => {
    dispatch(addItem({ searchItem: track.title }))
    navigation.push('Track', {
      id: track.track_id,
      searchTrack: track,
      canBeUnlisted: false
    })
  }, [track, navigation, dispatch])

  return (
    <SearchResultItem onPress={handlePress}>
      <TrackImage
        track={track}
        size={SquareSizes.SIZE_150_BY_150}
        style={styles.squareImage}
      />
      <View style={styles.nameContainer}>
        <Text numberOfLines={1} style={styles.name}>
          {track.title}
        </Text>
        <UserBadges
          style={styles.badgeContainer}
          nameStyle={styles.userName}
          user={track.user}
        />
      </View>
    </SearchResultItem>
  )
}

type PlaylistSearchResultProps = { item: SearchPlaylist }

const PlaylistSearchResult = (props: PlaylistSearchResultProps) => {
  const { item: playlist } = props
  const styles = useStyles()

  const navigation = useNavigation()
  const dispatch = useDispatch()

  const handlePress = useCallback(() => {
    dispatch(addItem({ searchItem: playlist.playlist_name }))
    navigation.push('Collection', {
      id: playlist.playlist_id,
      searchCollection: playlist
    })
  }, [playlist, navigation, dispatch])

  return (
    <SearchResultItem onPress={handlePress}>
      <CollectionImage
        collection={playlist}
        size={SquareSizes.SIZE_150_BY_150}
        style={styles.squareImage}
      />
      <View style={styles.nameContainer}>
        <Text numberOfLines={1} style={styles.name}>
          {playlist.playlist_name}
        </Text>
        <UserBadges
          style={styles.badgeContainer}
          nameStyle={styles.userName}
          user={playlist.user}
        />
      </View>
    </SearchResultItem>
  )
}

type AlbumSearchResultProps = { item: SearchPlaylist }

const AlbumSearchResult = (props: AlbumSearchResultProps) => {
  const { item: album } = props
  const styles = useStyles()

  const navigation = useNavigation()
  const dispatch = useDispatch()

  const handlePress = useCallback(() => {
    dispatch(addItem({ searchItem: album.playlist_name }))
    navigation.push('Collection', {
      id: album.playlist_id,
      searchCollection: album
    })
  }, [album, navigation, dispatch])

  return (
    <SearchResultItem onPress={handlePress}>
      <CollectionImage
        collection={album}
        size={SquareSizes.SIZE_150_BY_150}
        style={styles.squareImage}
      />
      <View style={styles.nameContainer}>
        <Text numberOfLines={1} style={styles.name}>
          {album.playlist_name}
        </Text>
        <UserBadges
          style={styles.badgeContainer}
          nameStyle={styles.userName}
          user={album.user}
        />
      </View>
    </SearchResultItem>
  )
}

export type SearchItemType = SearchUser | SearchTrack | SearchPlaylist

type SearchItemProps = {
  type: SectionHeader
  item: SearchItemType
}

export const SearchItem = ({ type, item }: SearchItemProps) => {
  switch (type) {
    case 'users':
      return <UserSearchResult item={item as SearchUser} />
    case 'tracks':
      return <TrackSearchResult item={item as SearchTrack} />
    case 'playlists':
      return <PlaylistSearchResult item={item as SearchPlaylist} />
    case 'albums':
      return <AlbumSearchResult item={item as SearchPlaylist} />
    default:
      return null
  }
}
