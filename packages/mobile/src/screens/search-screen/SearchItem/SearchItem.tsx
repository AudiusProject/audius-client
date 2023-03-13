import type { ReactNode } from 'react'
import { useCallback } from 'react'

import { SquareSizes } from '@audius/common'
import { StyleSheet, View, Text } from 'react-native'
import { useDispatch } from 'react-redux'

import { CollectionImage } from 'app/components/image/CollectionImage'
import { TrackImage } from 'app/components/image/TrackImage'
import { UserImage } from 'app/components/image/UserImage'
import UserBadges from 'app/components/user-badges/UserBadges'
import { useNavigation } from 'app/hooks/useNavigation'
import { addItem } from 'app/store/search/searchSlice'
import type {
  SearchPlaylist,
  SearchTrack,
  SearchUser
} from 'app/store/search/types'
import { useTheme } from 'app/utils/theme'

import { SearchResult } from './SearchResult'

export type SearchResultItem = SearchUser | SearchTrack | SearchPlaylist

const styles = StyleSheet.create({
  name: {
    fontSize: 14,
    fontFamily: 'AvenirNextLTPro-Medium'
  },
  badgeContainer: {
    flex: 1
  },
  nameContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  userImage: {
    borderRadius: 20,
    height: 40,
    width: 40,
    marginRight: 12
  },
  squareImage: {
    borderRadius: 4,
    height: 40,
    width: 40,
    marginRight: 12
  }
})

type ItemContainerProps = {
  onPress: () => void
  children?: ReactNode
}

// const SearchResult: React.FunctionComponent<ItemContainerProps> = ({
//   onPress,
//   children
// }) => {
//   const color = useColor('neutralLight4')
//   const backgroundColor = useColor('neutralLight8')
//   return (
//     <TouchableHighlight underlayColor={backgroundColor} onPress={onPress}>
//       <View style={styles.container}>
//         {children}
//         <IconArrow fill={color} height={18} width={18} />
//       </View>
//     </TouchableHighlight>
//   )
// }

type UserSearchResultProps = { item: SearchUser }

const UserSearchResult = ({ item: user }: UserSearchResultProps) => {
  const nameStyle = useTheme(styles.name, { color: 'neutral' })
  const imageStyle = useTheme(styles.userImage, {
    backgroundColor: 'neutralLight4'
  })
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const handlePress = useCallback(() => {
    dispatch(addItem({ searchItem: user.name }))
    navigation.push('Profile', { handle: user.handle })
  }, [user, navigation, dispatch])

  return (
    <SearchResult onPress={handlePress}>
      <UserImage
        user={user}
        style={imageStyle}
        size={SquareSizes.SIZE_150_BY_150}
      />
      <UserBadges
        style={styles.badgeContainer}
        nameStyle={nameStyle}
        user={user}
      />
    </SearchResult>
  )
}

type TrackSearchResultProps = { item: SearchTrack }
const TrackSearchResult = ({ item: track }: TrackSearchResultProps) => {
  const nameStyle = useTheme(styles.name, { color: 'neutral' })
  const userNameStyle = useTheme(styles.name, { color: 'neutralLight4' })
  const squareImageStyles = useTheme(styles.squareImage, {
    backgroundColor: 'neutralLight4'
  })

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
    <SearchResult onPress={handlePress}>
      <TrackImage
        track={track}
        size={SquareSizes.SIZE_150_BY_150}
        user={track.user}
        style={squareImageStyles}
      />
      <View style={styles.nameContainer}>
        <Text numberOfLines={1} style={nameStyle}>
          {track.title}
        </Text>
        <UserBadges
          style={styles.badgeContainer}
          nameStyle={userNameStyle}
          user={track.user}
        />
      </View>
    </SearchResult>
  )
}

type PlaylistSearchResultProps = { item: SearchPlaylist }
const PlaylistSearchResult = ({
  item: playlist
}: PlaylistSearchResultProps) => {
  const nameStyle = useTheme(styles.name, { color: 'neutral' })
  const userNameStyle = useTheme(styles.name, { color: 'neutralLight4' })
  const squareImageStyles = useTheme(styles.squareImage, {
    backgroundColor: 'neutralLight4'
  })

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
    <SearchResult onPress={handlePress}>
      <CollectionImage
        collection={playlist}
        size={SquareSizes.SIZE_150_BY_150}
        user={playlist.user}
        style={squareImageStyles}
      />
      <View style={styles.nameContainer}>
        <Text numberOfLines={1} style={nameStyle}>
          {playlist.playlist_name}
        </Text>
        <UserBadges
          style={styles.badgeContainer}
          nameStyle={userNameStyle}
          user={playlist.user}
        />
      </View>
    </SearchResult>
  )
}

type AlbumSearchResultProps = { item: SearchPlaylist }
const AlbumSearchResult = ({ item: album }: AlbumSearchResultProps) => {
  const nameStyle = useTheme(styles.name, { color: 'neutral' })
  const userNameStyle = useTheme(styles.name, { color: 'neutralLight4' })
  const squareImageStyles = useTheme(styles.squareImage, {
    backgroundColor: 'neutralLight4'
  })

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
    <SearchResult onPress={handlePress}>
      <CollectionImage
        collection={album}
        size={SquareSizes.SIZE_150_BY_150}
        user={album.user}
        style={squareImageStyles}
      />
      <View style={styles.nameContainer}>
        <Text numberOfLines={1} style={nameStyle}>
          {album.playlist_name}
        </Text>
        <UserBadges
          style={styles.badgeContainer}
          nameStyle={userNameStyle}
          user={album.user}
        />
      </View>
    </SearchResult>
  )
}

type SearchItemProps = {
  type: SectionHeader
  item: SearchUser | SearchTrack | SearchPlaylist
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
